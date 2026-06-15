/**
 * 代码片段库 — 编程练习模式
 *
 * 常见语法的简短片段，覆盖多种编程语言。
 */

export const CODE_SNIPPETS = [
  // JavaScript / TypeScript
  'function hello() { return "world" }',
  'const sum = (a, b) => a + b',
  'for (let i = 0; i < n; i++) { console.log(i) }',
  'if (condition) { doSomething() } else { doOther() }',
  'const items = array.filter(x => x > 0).map(x => x * 2)',
  'export default function App() { return <div /> }',
  'useEffect(() => { fetchData() }, [])',
  'const { data, loading } = useQuery()',
  'app.get("/api", async (req, res) => { res.json({ ok: true }) })',
  'Promise.all([a, b, c]).then(([x, y, z]) => { return x + y + z })',

  // Python
  'def fibonacci(n): return n if n <= 1 else fibonacci(n-1) + fibonacci(n-2)',
  'class Dog: def __init__(self, name): self.name = name',
  'with open("file.txt", "r") as f: data = f.read()',
  'result = [x * 2 for x in range(10) if x % 2 == 0]',
  'def decorator(func): return lambda *a: func(*a)',

  // Go
  'func main() { fmt.Println("hello world") }',
  'if err != nil { return nil, err }',
  'type Server struct { port int; host string }',
  'for i, v := range items { fmt.Printf("%d: %s", i, v) }',

  // Rust
  'fn main() { println!("hello world"); }',
  'let result = match x { Ok(v) => v, Err(e) => return e }',
  'struct User { name: String, age: u32 }',
  'impl User { fn new(name: &str) -> Self { Self { name: name.to_string(), age: 0 } } }',

  // Java
  'public static void main(String[] args) { System.out.println("hello"); }',
  'for (String item : list) { System.out.println(item); }',

  // SQL
  'SELECT id, name, email FROM users WHERE active = 1 ORDER BY created_at DESC',
  'INSERT INTO items (name, price) VALUES ("book", 9.99)',
  'UPDATE settings SET value = "dark" WHERE key = "theme"',

  // Shell
  'for file in *.txt; do echo "$file"; done',
  'cd /usr/local && ls -la | grep node',
  'cat data.json | jq ".items[] | .name"',

  // CSS
  '.card { display: flex; align-items: center; padding: 1rem; border-radius: 8px }',
  '@media (min-width: 768px) { .container { max-width: 720px } }',
]

/** 从代码片段库随机选取一个 */
export function generateCodePractice(): string {
  const idx = Math.floor(Math.random() * CODE_SNIPPETS.length)
  return CODE_SNIPPETS[idx]
}
