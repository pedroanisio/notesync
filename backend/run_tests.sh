#!/bin/bash

# Run pytest with coverage
pytest --cov=app --cov-report=term --cov-report=html:coverage_report tests/

# Open coverage report if on a desktop environment (optional)
if [ "$DISPLAY" ]; then
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open coverage_report/index.html
    elif command -v open >/dev/null 2>&1; then
        open coverage_report/index.html
    fi
fi

echo "Coverage report generated in coverage_report directory" 