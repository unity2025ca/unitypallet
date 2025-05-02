#!/bin/bash

# Find all TypeScript and TypeScript JSX files in the client/src directory
find ./client/src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
  # Skip the i18n.ts file itself and the temporary i18n-temp.ts file
  if [[ "$file" == *"/i18n.ts" ]] || [[ "$file" == *"/i18n-temp.ts" ]]; then
    continue
  fi
  
  # Check if the file imports from i18n.ts
  if grep -q "from \"@/lib/i18n\"" "$file" || grep -q "from '@/lib/i18n'" "$file"; then
    echo "Updating imports in $file"
    
    # Replace named imports with default import
    sed -i 's/import { translations } from "@\/lib\/i18n";/import translations from "@\/lib\/i18n-temp";/g' "$file"
    sed -i "s/import { translations } from '@\/lib\/i18n';/import translations from '@\/lib\/i18n-temp';/g" "$file"
    
    # Replace default imports
    sed -i 's/import translations from "@\/lib\/i18n";/import translations from "@\/lib\/i18n-temp";/g' "$file"
    sed -i "s/import translations from '@\/lib\/i18n';/import translations from '@\/lib\/i18n-temp';/g" "$file"
  fi
done

echo "Import update complete"
