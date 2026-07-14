#!/bin/bash
# Seed production database from here (not in CI/CD).
# Usage: ./seed-production.sh
exec "$(dirname "$0")/seed-env.sh" production
