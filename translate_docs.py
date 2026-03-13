import os
import re
import glob
from concurrent.futures import ThreadPoolExecutor
from deep_translator import GoogleTranslator

# Function to translate markdown text while preserving code blocks and links
def translate_md(content):
    translator = GoogleTranslator(source='auto', target='en')
    
    # We want to split out code blocks and inline code
    parts = re.split(r'(```[\s\S]*?```|\`[^\`]*?\`)', content)
    
    translated_parts = []
    for p in parts:
        if p.startswith('```') or p.startswith('`'):
            translated_parts.append(p)
            continue
            
        if not p.strip():
            translated_parts.append(p)
            continue
            
        # Protect links: split by [text](url)
        link_parts = re.split(r'(\[[^\]]+\]\([^)]+\))', p)
        t_link_parts = []
        for lp in link_parts:
            if re.match(r'^\[[^\]]+\]\([^)]+\)$', lp.strip()):
                t_link_parts.append(lp)
            else:
                # Protect images: ![text](url) - wait, covered by link_parts if we're careful.
                # Actually, let's just translate lp safely line by line
                lines = lp.split('\n')
                t_lines = []
                for line in lines:
                    if not line.strip() or line.strip().startswith('#') and ' ' not in line: # empty or just #
                        t_lines.append(line)
                    else:
                        try:
                            # Split by | for tables
                            if '|' in line:
                                cols = line.split('|')
                                t_cols = []
                                for col in cols:
                                    if col.strip() and not set(col.strip()).issubset({'-', ':'}):
                                        try:
                                            # Truncate and translate
                                            res = translator.translate(col.strip())
                                            t_cols.append(col.replace(col.strip(), res))
                                        except Exception:
                                            t_cols.append(col)
                                    else:
                                        t_cols.append(col)
                                t_lines.append('|'.join(t_cols))
                            else:
                                t_lines.append(translator.translate(line))
                        except Exception as e:
                            print(f"Failed to translate line: {line.strip()[:20]}")
                            t_lines.append(line)
                t_link_parts.append('\n'.join(t_lines))
                
        translated_parts.append(''.join(t_link_parts))
        
    return ''.join(translated_parts)

def process_file(filepath):
    print(f"Translating: {filepath}")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        translated = translate_md(content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(translated)
        print(f"Done: {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

if __name__ == '__main__':
    docs_dir = '/Users/huysynf/Downloads/autoclip/docs'
    md_files = glob.glob(os.path.join(docs_dir, '**', '*.md'), recursive=True)
    
    print(f"Found {len(md_files)} markdown files. Translating with Google Translator...")
    
    with ThreadPoolExecutor(max_workers=5) as executor:
        executor.map(process_file, md_files)
        
    print("All translations completed.")
