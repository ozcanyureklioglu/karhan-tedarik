import os
import glob

replacements = {
    'Global tedarik zinciri': 'Tedarik zinciri',
    'GLOBAL<span': 'MERKEZ<span',
    'GlobalINC': 'MerkezINC',
    'Global Tedarik ve Lojistik Çözümleri': 'Tedarik ve Lojistik Çözümleri',
    'global lojistik': 'lojistik',
    'Global Lojistik': 'Lojistik',
    'global tedarik': 'tedarik',
    'Global tedarik': 'Tedarik',
    'Global üretim': 'Üretim',
    'global üretim': 'üretim'
}

files = glob.glob('c:/Users/ozcan/KarhanTedarik/karhan-tedarik/**/*.html', recursive=True) + glob.glob('c:/Users/ozcan/KarhanTedarik/karhan-tedarik/**/*.js', recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {file}')
