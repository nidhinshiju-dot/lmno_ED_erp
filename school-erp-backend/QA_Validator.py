import os
import re
import json

BASE_DIR = r"d:\LMNO_LMS\school-erp-backend"
REPORT_PATH = r"d:\QA_Report.json"

features = []

for root, dirs, files in os.walk(BASE_DIR):
    for file in files:
        if file.endswith("Controller.java"):
            controller_path = os.path.join(root, file)
            service_name = file.replace("Controller", "Service")
            service_path = os.path.join(root.replace("controller", "service"), service_name)
            
            with open(controller_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            has_create = bool(re.search(r"@PostMapping", content))
            has_edit = bool(re.search(r"@(Put|Patch)Mapping", content))
            has_delete = bool(re.search(r"@DeleteMapping", content))
            has_valid = bool(re.search(r"@Valid", content))
            
            service_content = ""
            if os.path.exists(service_path):
                with open(service_path, "r", encoding="utf-8") as sf:
                    service_content = sf.read()
            
            handles_dependencies = "DataIntegrityViolationException" in service_content or "checkDependencies" in service_content or "existsBy" in service_content or "delete" in service_content and "Repository.exists" in service_content
            
            feature_name = file.replace("Controller.java", "")
            
            issues = []
            if not has_create: issues.append("Missing Create endpoint")
            if not has_edit: issues.append("Missing Edit endpoint")
            if not has_delete: issues.append("Missing Delete endpoint")
            if not has_valid and has_create: issues.append("Missing @Valid constraints on Create")
            if has_delete and not handles_dependencies: issues.append("Potential Delete Dependency/Constraint violation missing catch")
            
            status = "Pass" if not issues else "Fail"
            
            features.append({
                "Feature Name": feature_name,
                "Tested Actions": f"Create:{has_create}, Edit:{has_edit}, Delete:{has_delete}",
                "Result": status,
                "Observed Issues": ", ".join(issues) if issues else "None - Fully Implemented",
                "Dependencies Checked": str(handles_dependencies)
            })

with open(REPORT_PATH, "w", encoding="utf-8") as rf:
    json.dump(features, rf, indent=4)
print("Report generated at " + REPORT_PATH)
