import os

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if '\\"' in content:
            new_content = content.replace('\\"', '"')
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Fixed {filepath}")
    except Exception as e:
        print(f"Failed {filepath}: {e}")

for root, _, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root or '.next' in root or 'venv' in root:
        continue
    for file in files:
        if file.endswith('.py'):
            fix_file(os.path.join(root, file))
