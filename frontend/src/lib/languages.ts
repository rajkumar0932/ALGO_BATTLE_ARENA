export const SUPPORTED_LANGUAGES = [
  { id: "javascript", label: "JavaScript (Node.js)", icon: "JS" },
  { id: "python", label: "Python (3.10)", icon: "PY" },
  { id: "java", label: "Java (15)", icon: "JA" },
  { id: "c++", label: "C++ (GCC)", icon: "C++" },
];

export function getBoilerplate(language: string, signature: string = "// Write your solution here"): string {
  switch (language) {
    case "python":
      return `import sys
import json

def solve(input_data):
    # ${signature}
    pass

if __name__ == "__main__":
    input_str = sys.stdin.read()
    if input_str:
        input_data = json.loads(input_str)
        result = solve(input_data)
        print(json.dumps(result))
`;
    case "java":
      return `import java.util.*;
import java.io.*;
// Note: You must use the class name Main
public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        String inputStr = sb.toString();
        // Since Java lacks built-in JSON parsing without external libraries, 
        // this is a simplified stub. You will need to parse the JSON string manually.
        System.out.println(solve(inputStr));
    }
    
    public static String solve(String inputStr) {
        // ${signature}
        return "true";
    }
}
`;
    case "c++":
      return `#include <iostream>
#include <string>

using namespace std;

string solve(const string& inputStr) {
    // ${signature}
    return "true";
}

int main() {
    string inputStr;
    string line;
    while (getline(cin, line)) {
        inputStr += line;
    }
    
    // C++ lacks built-in JSON parsing. Parse manually.
    string result = solve(inputStr);
    cout << result << endl;
    return 0;
}
`;
    case "javascript":
    default:
      return `/**
 * @param {any} input
 * @return {any}
 */
function solve(input) {
  // ${signature}
}

// Do not modify below this line
const fs = require('fs');
const inputStr = fs.readFileSync('/dev/stdin', 'utf-8');
if (inputStr) {
  const input = JSON.parse(inputStr);
  console.log(JSON.stringify(solve(input)));
}
`;
  }
}
