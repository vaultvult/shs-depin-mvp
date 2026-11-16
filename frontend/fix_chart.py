import re

filepath = 'src/app/page.tsx'
with open(filepath, 'r') as f:
    code = f.read()

# The old ending of the Investor tab
old_block = '''                </div>
              </div>
            )}

            {activeTab === 'consumer' && ('''

# The new ending with the Chart
new_block = '''                </div>
                <div className="mt-8 bg-gray-950 p-6 rounded-lg border border-gray-800">
                  <h3 className="text-lg font-bold text-white mb-4">Projected Yield (Last 7 Days)</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockYieldData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="day" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", color: "#fff" }} itemStyle={{ color: "#3B82F6" }} />
                        <Line type="monotone" dataKey="yield" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'consumer' && ('''

if old_block in code:
    code = code.replace(old_block, new_block)
    with open(filepath, 'w') as f:
        f.write(code)
    print("✅ Chart successfully added to Investor tab!")
else:
    print("❌ Could not find the exact code block. Please check page.tsx manually.")
