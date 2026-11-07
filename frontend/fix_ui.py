import re

filepath = 'src/app/page.tsx'
with open(filepath, 'r') as f:
    code = f.read()

# Replace the opening span with a button
old_span = '<span className="text-sm font-mono text-emerald-400">'
new_button = '<button onClick={() => { navigator.clipboard.writeText(user?.wallet?.address || ""); alert("Address copied to clipboard: " + user?.wallet?.address); }} className="text-sm font-mono text-emerald-400 hover:text-emerald-300 cursor-pointer underline decoration-dotted" title="Click to copy full address">'

code = code.replace(old_span, new_button)

# Replace the specific closing tag
old_closing = '''{user?.wallet?.address?.slice(-4)}
              </span>'''
new_closing = '''{user?.wallet?.address?.slice(-4)} (Copy)
              </button>'''

code = code.replace(old_closing, new_closing)

with open(filepath, 'w') as f:
    f.write(code)
print("✅ UI updated successfully!")
