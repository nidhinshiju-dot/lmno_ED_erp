import os
import re

BASE_DIR = r"d:\LMNO_LMS\school-erp-backend"
SERVICES = ["auth-service", "core-service", "fee-service", "lms-service"]

# Target: Add DataIntegrityViolationException handler
HANDLER_ADDITION = """
    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolationException(org.springframework.dao.DataIntegrityViolationException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Cannot delete this record because it is referenced by other records in the system.");
        error.put("details", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
"""

for root, dirs, files in os.walk(BASE_DIR):
    for file in files:
        if file == "GlobalExceptionHandler.java":
            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            if "DataIntegrityViolationException.class" not in content:
                # Insert right before the last closing brace
                insert_pos = content.rfind("}")
                if insert_pos != -1:
                    new_content = content[:insert_pos] + HANDLER_ADDITION + content[insert_pos:]
                    with open(file_path, "w", encoding="utf-8") as fw:
                        fw.write(new_content)
                    print(f"Updated: {file_path}")

print("Phase 2 Remediation (Exception Handler Updates) Completed.")
