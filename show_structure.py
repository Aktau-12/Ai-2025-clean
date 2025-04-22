import os

def print_directory_tree(startpath, max_level=2, prefix=""):
    for root, dirs, files in os.walk(startpath):
        level = root.replace(startpath, '').count(os.sep)
        if level > max_level:
            continue
        indent = '│   ' * level + '├── '
        print(f"{indent}{os.path.basename(root)}/")
        subindent = '│   ' * (level + 1)
        for f in files:
            print(f"{subindent}{f}")

# Укажи путь к своей папке проекта
project_path = "."  # Текущая директория
print_directory_tree(project_path, max_level=3)
