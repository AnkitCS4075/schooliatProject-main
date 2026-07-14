#!/bin/bash
# Seed staging database from here (not in CI/CD).
# Usage: ./seed-staging.sh
exec "$(dirname "$0")/seed-env.sh" staging
