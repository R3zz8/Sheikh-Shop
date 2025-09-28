import { NextRequest } from 'next/server';

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  variants: ExperimentVariant[];
  trafficAllocation: number; // Percentage of traffic to include in experiment
  targetAudience?: TargetAudience;
  metrics: ExperimentMetric[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  trafficAllocation: number; // Percentage of experiment traffic
  config: Record<string, any>;
  isControl: boolean;
}

export interface TargetAudience {
  userSegments?: string[];
  deviceTypes?: string[];
  locations?: string[];
  userAttributes?: Record<string, any>;
}

export interface ExperimentMetric {
  id: string;
  name: string;
  type: 'conversion' | 'revenue' | 'engagement' | 'custom';
  goal: 'increase' | 'decrease' | 'maintain';
  targetValue?: number;
}

export interface ExperimentResult {
  experimentId: string;
  variantId: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  eventType: 'view' | 'click' | 'conversion' | 'revenue';
  value?: number;
  metadata?: Record<string, any>;
}

export class ABTestingManager {
  private static instance: ABTestingManager;
  private experiments: Map<string, Experiment> = new Map();
  private results: ExperimentResult[] = [];

  private constructor() {
    this.initializeDefaultExperiments();
  }

  public static getInstance(): ABTestingManager {
    if (!ABTestingManager.instance) {
      ABTestingManager.instance = new ABTestingManager();
    }
    return ABTestingManager.instance;
  }

  // Initialize with some default experiments
  private initializeDefaultExperiments() {
    const experiments: Experiment[] = [
      {
        id: 'cta-button-color',
        name: 'CTA Button Color Test',
        description: 'Test different button colors for add to cart',
        status: 'running',
        startDate: new Date(),
        trafficAllocation: 50,
        variants: [
          {
            id: 'control',
            name: 'Control (Amber)',
            description: 'Original amber button',
            trafficAllocation: 50,
            config: { buttonColor: 'amber' },
            isControl: true,
          },
          {
            id: 'variant-a',
            name: 'Variant A (Green)',
            description: 'Green button',
            trafficAllocation: 50,
            config: { buttonColor: 'green' },
            isControl: false,
          },
        ],
        metrics: [
          {
            id: 'add-to-cart-rate',
            name: 'Add to Cart Rate',
            type: 'conversion',
            goal: 'increase',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'product-layout',
        name: 'Product Layout Test',
        description: 'Test different product card layouts',
        status: 'running',
        startDate: new Date(),
        trafficAllocation: 30,
        variants: [
          {
            id: 'control',
            name: 'Control (Grid)',
            description: 'Original grid layout',
            trafficAllocation: 50,
            config: { layout: 'grid' },
            isControl: true,
          },
          {
            id: 'variant-a',
            name: 'Variant A (List)',
            description: 'List layout',
            trafficAllocation: 50,
            config: { layout: 'list' },
            isControl: false,
          },
        ],
        metrics: [
          {
            id: 'product-view-rate',
            name: 'Product View Rate',
            type: 'engagement',
            goal: 'increase',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    experiments.forEach(exp => {
      this.experiments.set(exp.id, exp);
    });
  }

  // Get variant for user/session
  getVariant(experimentId: string, userId?: string, sessionId?: string): string | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // Check if user is in target audience
    if (!this.isUserInTargetAudience(experiment, userId, sessionId)) {
      return null;
    }

    // Check traffic allocation
    const hash = this.generateHash(experimentId, userId, sessionId);
    if (hash > experiment.trafficAllocation) {
      return null;
    }

    // Assign variant based on hash
    const variantHash = hash / experiment.trafficAllocation;
    let cumulativeAllocation = 0;

    for (const variant of experiment.variants) {
      cumulativeAllocation += variant.trafficAllocation / 100;
      if (variantHash <= cumulativeAllocation) {
        return variant.id;
      }
    }

    return experiment.variants[0].id; // Fallback to first variant
  }

  // Get experiment configuration
  getExperimentConfig(experimentId: string, variantId: string): Record<string, any> | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      return null;
    }

    const variant = experiment.variants.find(v => v.id === variantId);
    return variant ? variant.config : null;
  }

  // Track experiment result
  trackResult(result: Omit<ExperimentResult, 'timestamp'>): void {
    this.results.push({
      ...result,
      timestamp: new Date(),
    });
  }

  // Get experiment results
  getExperimentResults(experimentId: string): {
    variants: { [variantId: string]: ExperimentResult[] };
    summary: {
      totalParticipants: number;
      conversionRates: { [variantId: string]: number };
      revenue: { [variantId: string]: number };
    };
  } {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      return { variants: {}, summary: { totalParticipants: 0, conversionRates: {}, revenue: {} } };
    }

    const variantResults: { [variantId: string]: ExperimentResult[] } = {};
    const conversionRates: { [variantId: string]: number } = {};
    const revenue: { [variantId: string]: number } = {};

    // Initialize variant results
    experiment.variants.forEach(variant => {
      variantResults[variant.id] = [];
      conversionRates[variant.id] = 0;
      revenue[variant.id] = 0;
    });

    // Group results by variant
    this.results
      .filter(result => result.experimentId === experimentId)
      .forEach(result => {
        if (variantResults[result.variantId]) {
          variantResults[result.variantId].push(result);
        }
      });

    // Calculate metrics
    Object.keys(variantResults).forEach(variantId => {
      const results = variantResults[variantId];
      const views = results.filter(r => r.eventType === 'view').length;
      const conversions = results.filter(r => r.eventType === 'conversion').length;
      const revenueValue = results
        .filter(r => r.eventType === 'revenue')
        .reduce((sum, r) => sum + (r.value || 0), 0);

      conversionRates[variantId] = views > 0 ? (conversions / views) * 100 : 0;
      revenue[variantId] = revenueValue;
    });

    const totalParticipants = Object.values(variantResults).reduce(
      (sum, results) => sum + results.length,
      0
    );

    return {
      variants: variantResults,
      summary: {
        totalParticipants,
        conversionRates,
        revenue,
      },
    };
  }

  // Check if user is in target audience
  private isUserInTargetAudience(
    experiment: Experiment,
    userId?: string,
    sessionId?: string
  ): boolean {
    if (!experiment.targetAudience) {
      return true; // No targeting means all users
    }

    const { targetAudience } = experiment;
    
    // Add more sophisticated targeting logic here
    // For now, we'll just return true
    return true;
  }

  // Generate consistent hash for user/session
  private generateHash(experimentId: string, userId?: string, sessionId?: string): number {
    const input = `${experimentId}:${userId || sessionId || 'anonymous'}`;
    let hash = 0;
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash) % 100;
  }

  // Get all active experiments
  getActiveExperiments(): Experiment[] {
    return Array.from(this.experiments.values()).filter(
      exp => exp.status === 'running'
    );
  }

  // Create new experiment
  createExperiment(experiment: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newExperiment: Experiment = {
      ...experiment,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.experiments.set(id, newExperiment);
    return id;
  }

  // Update experiment
  updateExperiment(id: string, updates: Partial<Experiment>): boolean {
    const experiment = this.experiments.get(id);
    if (!experiment) {
      return false;
    }

    this.experiments.set(id, {
      ...experiment,
      ...updates,
      updatedAt: new Date(),
    });
    
    return true;
  }

  // Get experiment by ID
  getExperiment(id: string): Experiment | null {
    return this.experiments.get(id) || null;
  }
}

// Export singleton instance
export const abTestingManager = ABTestingManager.getInstance();

// Hook for client-side A/B testing
export function useABTest(experimentId: string, userId?: string, sessionId?: string) {
  const variant = abTestingManager.getVariant(experimentId, userId, sessionId);
  const config = variant ? abTestingManager.getExperimentConfig(experimentId, variant) : null;
  
  return {
    variant,
    config,
    isInExperiment: variant !== null,
  };
}

// Track experiment event
export function trackExperimentEvent(
  experimentId: string,
  variantId: string,
  eventType: ExperimentResult['eventType'],
  userId?: string,
  sessionId?: string,
  value?: number,
  metadata?: Record<string, any>
) {
  abTestingManager.trackResult({
    experimentId,
    variantId,
    userId,
    sessionId: sessionId || 'unknown',
    eventType,
    value,
    metadata,
  });
}

// Get experiment results for analytics
export function getExperimentAnalytics(experimentId: string) {
  return abTestingManager.getExperimentResults(experimentId);
}

// Middleware helper for server-side A/B testing
export function withABTest(experimentId: string) {
  return (handler: (req: NextRequest, variant: string | null, config: Record<string, any> | null) => Promise<NextResponse>) => {
    return async (req: NextRequest): Promise<NextResponse> => {
      const userId = req.headers.get('x-user-id') || undefined;
      const sessionId = req.headers.get('x-session-id') || 'unknown';
      
      const variant = abTestingManager.getVariant(experimentId, userId, sessionId);
      const config = variant ? abTestingManager.getExperimentConfig(experimentId, variant) : null;
      
      return handler(req, variant, config);
    };
  };
}

