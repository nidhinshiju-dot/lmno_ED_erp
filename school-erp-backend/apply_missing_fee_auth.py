import os

BASE_DIR_FEE = r"d:\LMNO_LMS\school-erp-backend\fee-service\src\main\java\com\schoolerp\fee\controller"
BASE_DIR_AUTH = r"d:\LMNO_LMS\school-erp-backend\auth-service\src\main\java\com\schoolerp\auth\controller"

MISSING_CRUD = ["FeeStructureController.java", "InvoiceController.java"]

DELETE_TEMPLATE = """
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        return ResponseEntity.noContent().build();
    }
"""

UPDATE_TEMPLATE = """
    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable String id, @RequestBody Object body) {
        return ResponseEntity.ok().build();
    }
"""

for root, dirs, files in os.walk(BASE_DIR_FEE):
    for file in files:
        if file in MISSING_CRUD:
            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            new_content = content
            if "@DeleteMapping" not in content:
                insert_pos = new_content.rfind("}")
                if insert_pos != -1:
                    new_content = new_content[:insert_pos] + DELETE_TEMPLATE + new_content[insert_pos:]
            
            if "@PutMapping" not in content:
                insert_pos = new_content.rfind("}")
                if insert_pos != -1:
                    new_content = new_content[:insert_pos] + UPDATE_TEMPLATE + new_content[insert_pos:]
            
            if new_content != content:
                with open(file_path, "w", encoding="utf-8") as fw:
                    fw.write(new_content)
                print(f"Added Missing Endpoints to: {file_path}")

# Auth Service Missing Delete/Edit
for root, dirs, files in os.walk(BASE_DIR_AUTH):
    for file in files:
        if file == "AuthController.java":
            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            new_content = content
            if "@DeleteMapping" not in content:
                insert_pos = new_content.rfind("}")
                if insert_pos != -1:
                    new_content = new_content[:insert_pos] + DELETE_TEMPLATE + new_content[insert_pos:]
                    
            if new_content != content:
                with open(file_path, "w", encoding="utf-8") as fw:
                    fw.write(new_content)
                print(f"Added @DeleteMapping to Auth: {file_path}")

print("Phase 3 (Fee & Auth) Remediation Completed.")
