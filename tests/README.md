# Testing Documentation

This directory contains comprehensive testing documentation and test data for FunnelSight.

## Directory Structure

```
tests/
├── data/                    # Test CSV files
│   ├── test_data.csv       # Basic test data for CSV upload
│   └── test-multichannel.csv # Multi-channel campaign test data
├── reports/                 # Test reports and QA documentation
│   ├── *_TEST_REPORT.md    # Feature-specific test reports
│   ├── QA_*.md             # QA validation reports
│   └── *_SUMMARY.txt       # Executive summaries
├── CODE_REFERENCES.md       # Code reference documentation
├── GA4_ACTION_PLAN.md       # GA4 integration testing plan
├── ISSUES_AND_FIXES.md      # Bug tracking and fixes
├── README_TESTING.md        # Original testing README
├── TECHNICAL_FINDINGS.md    # Technical analysis findings
├── TESTING_CHECKLIST.md     # Testing checklist
└── TESTING_DELIVERABLES.md  # Testing deliverables summary
```

## Test Reports Overview

### Core Feature Tests
- **API_TEST_REPORT.md** - API endpoint testing
- **GA4_TESTING_REPORT.md** - Google Analytics 4 integration tests
- **INSIGHT_GENERATION_TEST_REPORT.md** - AI insights testing
- **DASHBOARD_VISUALIZATION_TEST_REPORT.md** - Dashboard and charts testing

### QA Validation
- **FINAL_QA_REPORT.md** - Final QA sign-off
- **QA_VALIDATION_REPORT.md** - Validation testing results
- **PRODUCTION_QA_TEST_REPORT.md** - Production environment testing

### Regression Testing
- **COMPREHENSIVE_REGRESSION_TEST_REPORT.md** - Full regression suite
- **REGRESSION_TEST_REPORT_2025_10_28.md** - Latest regression run

## Test Data

### test_data.csv
Basic CSV file for testing the upload functionality with standard fields:
- Email, campaign name, UTM parameters
- Registration dates, event information
- Basic metrics

### test-multichannel.csv
Multi-channel campaign data for testing:
- Same campaign across different channels
- Attribution testing
- Channel-specific metrics

## Running Tests

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Manual testing can be performed via:
# 1. Navigate to http://localhost:5000
# 2. Login with test account
# 3. Use Upload Data page to test CSV imports
```

## Test Account

Demo account credentials are documented in `docs/DEMO_ACCOUNT_GUIDE.md`.
