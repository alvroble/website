"""Check bilingual Hugo output and protect technical examples in translations.

Usage: python3 scripts/check-translations.py /path/to/hugo/output
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import re
import sys


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.lang = None
        self.links = []
        self.ids = set()
        self.languages = []
        self.feed(text)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == 'html':
            self.lang = attrs.get('lang')
        if 'id' in attrs:
            self.ids.add(attrs['id'])
        for attribute in ('href', 'src', 'poster'):
            if attrs.get(attribute):
                self.links.append(attrs[attribute])
        if tag == 'a' and attrs.get('hreflang'):
            self.languages.append((attrs['hreflang'], attrs['href']))


def check(output):
    root = Path(__file__).resolve().parents[1]
    errors = []
    documents = {p: Page(p.read_text()) for p in output.rglob('*.html')}
    checked = 0
    for path, page in documents.items():
        relative = path.relative_to(output).as_posix()
        expected = 'es-ES' if relative.startswith('es/') else 'en-US'
        if page.lang != expected:
            errors.append(f'{relative}: expected language {expected}, got {page.lang}')
        if 'http-equiv="refresh"' in path.read_text() or 'http-equiv=refresh' in path.read_text():
            continue
        if {lang for lang, _ in page.languages} != {'en', 'es'}:
            errors.append(f'{relative}: incomplete language switcher')
        base = 'https://alvroble.com/' + relative.removesuffix('index.html')
        for reference in page.links:
            url = urlsplit(urljoin(base, reference))
            if url.netloc != 'alvroble.com' or url.scheme not in ('http', 'https'):
                continue
            target = output / unquote(url.path).lstrip('/')
            if target.is_dir():
                target /= 'index.html'
            if not target.is_file():
                errors.append(f'{relative}: missing local target {reference}')
            elif url.fragment and target in documents:
                if unquote(url.fragment) not in documents[target].ids:
                    errors.append(f'{relative}: missing anchor {reference}')
            checked += 1
    translations = list((root / 'content').rglob('*.es.md'))
    for spanish in translations:
        original = spanish.with_name(spanish.name.replace('.es.md', '.md'))
        en, es = original.read_text(), spanish.read_text()
        # Shell commands, mnemonic vectors and addresses must stay byte-identical.
        pattern = r'```[^\n]*\n.*?```'
        en_blocks, es_blocks = re.findall(pattern, en, re.S), re.findall(pattern, es, re.S)
        # Two directory trees intentionally translate their explanatory comments.
        en_blocks = [b for b in en_blocks if '├──' not in b]
        es_blocks = [b for b in es_blocks if '├──' not in b]
        if en_blocks != es_blocks:
            errors.append(f'{spanish.relative_to(root)}: changed technical examples')
        if len(re.findall(r'^#{1,6} ', en, re.M)) != len(re.findall(r'^#{1,6} ', es, re.M)):
            errors.append(f'{spanish.relative_to(root)}: missing article sections')
        links = r'https?://[^\s)"<>]+'
        if set(re.findall(links, en)) != set(re.findall(links, es)):
            errors.append(f'{spanish.relative_to(root)}: changed external references')
        # Core pages and articles must switch to their equivalent, not the homepage.
        route = spanish.parent.relative_to(root / 'content').as_posix()
        route = '' if route == '.' else route + '/'
        for lang, prefix, counterpart in [('en', '', '/es/'), ('es', 'es/', '/')]:
            target = output / prefix / route / 'index.html'
            parsed = documents.get(target)
            other = 'es' if lang == 'en' else 'en'
            if not parsed or (other, counterpart + route) not in parsed.languages:
                errors.append(f'{target}: incorrect counterpart link')
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'Passed: {len(documents)} pages, {checked} local links/media/anchors, '
          f'{len(translations)} content pairs, preserved examples and external references.')


if __name__ == '__main__':
    check(Path(sys.argv[1]).resolve())
