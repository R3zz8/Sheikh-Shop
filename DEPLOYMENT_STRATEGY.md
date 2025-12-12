# Deployment and Rollback Strategy

This document outlines the strategy for deploying new versions of the Sheikh Shop application to production, including canary releases, smoke testing, and rollback procedures.

## 1. CI/CD Pipeline Overview

The deployment process is automated via the GitHub Actions workflow defined in `.github/workflows/deploy.yml`. The pipeline ensures that code is linted, type-checked, tested, and built before any deployment occurs.

The key stages are:
1.  **Validation:** `lint`, `type-check`, `test` jobs run in parallel.
2.  **Build:** A production-ready build is created and archived as an artifact.
3.  **Deploy to Staging:** The build is deployed to a staging environment for final verification.
4.  **Canary Deploy to Production:** The new version is rolled out to a small subset of production traffic.
5.  **Manual Approval:** A manual approval step is required before a full rollout.
6.  **Full Production Rollout:** The new version is deployed to all production servers.

## 2. Canary Deployment

To minimize risk, we use a canary deployment strategy.

-   **Initial Rollout:** The `deploy-production-canary` job deploys the new version to a limited number of production instances, initially receiving **10%** of user traffic. The specific mechanism (e.g., load balancer rules, feature flags) should be configured in the deployment scripts.
-   **Monitoring:** During the canary phase, it is critical to closely monitor key application metrics. This includes:
    -   **Error Rate:** Watch for spikes in new or existing errors in Sentry.
    -   **Performance:** Monitor RUM data (e.g., from Sentry or another provider) for latency, Core Web Vitals, and transaction durations.
    -   **Resource Usage:** Check CPU and memory utilization on the canary instances.
-   **Decision:** Based on the monitoring data, a decision is made to proceed with a full rollout or to roll back.

## 3. Post-Deploy Smoke Tests

Immediately after the canary and full production deployments, automated smoke tests should be executed against the live environment.

-   **Purpose:** To quickly verify that critical user journeys are functioning correctly.
-   **Test Cases:** The smoke test suite should cover essential functionalities, such as:
    1.  Homepage renders correctly.
    2.  User can successfully log in and log out.
    3.  Products can be viewed.
    4.  Items can be added to the shopping cart.
    5.  The checkout process can be initiated.
-   **Automation:** These tests should be scripted (e.g., using Playwright or Cypress) and triggered automatically by the CI/CD pipeline. A failure in the smoke test suite should immediately trigger the automated rollback process.

## 4. Rollback Plan

A robust rollback plan is essential for recovering from a failed deployment.

### Automated Rollback

An automated rollback should be triggered under the following conditions:
-   The post-deployment smoke tests fail.
-   A critical threshold of errors is exceeded in Sentry immediately after deployment (requires configuration of Sentry alerts).

The rollback process involves re-deploying the previously known stable version. The GitHub Actions workflow can be configured to fetch the commit SHA of the last successful production deployment and re-run the deployment job with that specific commit.

### Manual Rollback

A manual rollback may be necessary if issues are detected through manual testing or monitoring that were not caught by automated checks.

**Procedure:**
1.  **Halt Full Rollout:** If the deployment is in the canary phase, prevent the full rollout by rejecting the manual approval step in GitHub Actions.
2.  **Identify Stable Commit:** Find the commit hash of the last stable version from the Git history or deployment logs.
3.  **Trigger Manual Deployment:** Manually trigger the `deploy-production-full` job (or a dedicated rollback job) and provide the stable commit hash as a parameter.
4.  **Verify:** Once the rollback deployment is complete, re-run the smoke tests and monitor the system to ensure it has returned to a stable state.
5.  **Post-mortem:** Conduct a post-mortem analysis to understand the root cause of the failed deployment and improve the process to prevent future occurrences.
