import os

filepath = r"d:\LMNO_LMS\school-erp-web\admin-portal\src\lib\api.ts"
with open(filepath, "r", encoding="utf-8") as f:
    text = f.read()

fetch_old = """    const defaultHeaders: Record<string, string> = {
        "Content-Type": "application/json",
    };"""
fetch_new = """    const defaultHeaders: Record<string, string> = {};
    if (!(typeof FormData !== "undefined" && options.body instanceof FormData)) {
        defaultHeaders["Content-Type"] = "application/json";
    }"""
text = text.replace(fetch_old, fetch_new)

student_old = """export const StudentService = {
    getAll: () => fetchWithAuth("/students"),
    getById: (id: string) => fetchWithAuth(`/students/${id}`),
    update: (id: string, data: Record<string, unknown>) => fetchWithAuth(`/students/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};"""
student_new = """export const StudentService = {
    getAll: () => fetchWithAuth("/students"),
    getById: (id: string) => fetchWithAuth(`/students/${id}`),
    update: (id: string, data: Record<string, unknown>) => fetchWithAuth(`/students/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    checkParent: (contact: string) => fetchWithAuth(`/students/check-parent?contact=${encodeURIComponent(contact)}`),
};"""
text = text.replace(student_old, student_new)

file_old = """export const FileService = {
    getAll: () => fetchWithAuth("/files"),
    getByCategory: (category: string) => fetchWithAuth(`/files/category/${category}`),
    create: (data: Record<string, unknown>) => fetchWithAuth("/files", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) => fetchWithAuth(`/files/${id}`, { method: "DELETE" }),
};"""
file_new = """export const FileService = {
    getAll: () => fetchWithAuth("/files"),
    getByCategory: (category: string) => fetchWithAuth(`/files/category/${category}`),
    create: (data: Record<string, unknown>) => fetchWithAuth("/files", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: string) => fetchWithAuth(`/files/${id}`, { method: "DELETE" }),
    upload: (file: File, type: string, category: string) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        formData.append("category", category);
        return fetchWithAuth("/files/upload", { method: "POST", body: formData as any });
    },
};"""
text = text.replace(file_old, file_new)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(text)
print("Updated api.ts")
