#!/bin/bash

# Find all files using the problematic import
files=$(find ./client/src -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "import { translations } from \"@/lib/i18n\"")

# Loop through each file and replace the import statement
for file in $files; do
  echo "Fixing imports in $file"
  sed -i 's/import { translations } from "@\/lib\/i18n";/import translations from "@\/lib\/i18n";/g' "$file"
done

echo "Completed fixing imports in $(echo "$files" | wc -l) files"
