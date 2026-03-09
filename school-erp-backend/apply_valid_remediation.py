import os
import re

BASE_DIR = r"d:\LMNO_LMS\school-erp-backend"
SERVICES = ["auth-service", "core-service", "fee-service", "lms-service"]

# 1. Update Controllers
for root, dirs, files in os.walk(BASE_DIR):
    for file in files:
        if file.endswith("Controller.java"):
            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Check if there's any @RequestBody that needs @Valid
            # This regex looks for @RequestBody optionally preceded by some annotations or spaces, but not @Valid.
            # A simpler approach: replace all "@RequestBody" with "@Valid @RequestBody", 
            # and ignore if we accidentally get "@Valid @Valid @RequestBody" by replacing "@Valid @Valid" back to "@Valid".
            
            modified_content = re.sub(r'(?<!@Valid\s)(?<!@Valid\n)(?<!@Valid\r\n)@RequestBody', '@Valid @RequestBody', content)
            # Cleanup multiple nested valid annotations if existed
            modified_content = modified_content.replace('@Valid @Valid @RequestBody', '@Valid @RequestBody')
            modified_content = modified_content.replace('@Valid @Valid', '@Valid')
            
            if modified_content != content:
                # Add import if missing
                if 'jakarta.validation.Valid' not in modified_content and 'javax.validation.Valid' not in modified_content:
                    # Find last import
                    imports = list(re.finditer(r'^import .*;', modified_content, flags=re.MULTILINE))
                    if imports:
                        last_import = imports[-1]
                        insert_pos = last_import.end()
                        modified_content = modified_content[:insert_pos] + '\nimport jakarta.validation.Valid;' + modified_content[insert_pos:]
                    elif 'package ' in modified_content:
                        # insert after package
                        pkg = re.search(r'^package .*;', modified_content, flags=re.MULTILINE)
                        insert_pos = pkg.end()
                        modified_content = modified_content[:insert_pos] + '\n\nimport jakarta.validation.Valid;' + modified_content[insert_pos:]
                
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(modified_content)
                print(f"Updated: {file_path}")

# 2. Generate Global Exception Handlers
HANDLER_TEMPLATE = f"""package com.schoolerp.{{svc}}.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {{

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {{
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {{
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        }});
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }}
}}
"""

for svc in SERVICES:
    svc_name = svc.split("-")[0] # auth, core, fee, lms
    exception_dir = os.path.join(BASE_DIR, svc, "src", "main", "java", "com", "schoolerp", svc_name, "exception")
    os.makedirs(exception_dir, exist_ok=True)
    
    handler_path = os.path.join(exception_dir, "GlobalExceptionHandler.java")
    if not os.path.exists(handler_path):
        with open(handler_path, "w", encoding="utf-8") as f:
            f.write(HANDLER_TEMPLATE.replace("{svc}", svc_name))
        print(f"Created: {handler_path}")

print("Phase 1 Remediation Completed.")
