package com.schoolerp.lms.service.ai.rag;

import com.schoolerp.lms.config.tenant.TenantContext;
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.DocumentParser;
import dev.langchain4j.data.document.parser.apache.pdfbox.ApachePdfBoxDocumentParser;
import dev.langchain4j.data.document.splitter.DocumentSplitters;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.EmbeddingStoreIngestor;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import dev.langchain4j.model.embedding.AllMiniLmL6V2EmbeddingModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

// Using an InMemory Embedding Store for the initial prototype.
// Will swap out for PgVector in production environment.
@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentProcessorService {

    // Ideally, injected pg vector. Using in memory for simplicity of prototyping.
    private final EmbeddingStore<TextSegment> embeddingStore = new InMemoryEmbeddingStore<>();
    private final EmbeddingModel embeddingModel = new AllMiniLmL6V2EmbeddingModel();

    public void processTeacherUpload(MultipartFile file, String teacherId, String courseId) {
        log.info("Processing document upload for teacher {} and course {}", teacherId, courseId);
        String tenantId = TenantContext.getCurrentTenant();

        try (InputStream inputStream = file.getInputStream()) {
            DocumentParser parser = new ApachePdfBoxDocumentParser();
            
            // Assuming Langchain4j 0.27 style parsing
            Document document = parser.parse(inputStream);
            
            // Add metadata for filtering
            document.metadata()
                    .add("tenantId", tenantId)
                    .add("courseId", courseId)
                    .add("teacherId", teacherId);

            EmbeddingStoreIngestor ingestor = EmbeddingStoreIngestor.builder()
                    .documentSplitter(DocumentSplitters.recursive(1000, 200)) // Max 1000 chars, 200 overlap
                    .embeddingModel(embeddingModel)
                    .embeddingStore(embeddingStore)
                    .build();

            ingestor.ingest(document);
            log.info("Successfully ingested document: {}", file.getOriginalFilename());

        } catch (Exception e) {
            log.error("Failed to process document", e);
            throw new RuntimeException("Document processing failed", e);
        }
    }
    
    public String retrieveContextForQuery(String query, String courseId) {
        String tenantId = TenantContext.getCurrentTenant();
        
        // Retrieval Logic:
        // In reality, this searches the EmbeddingStore using the embedded query.
        // We will mock the lookup retrieval here since we are using InMemory without robust metadata filtering out of the box.
        
        log.info("Retrieving RAG context for tenant: {} course: {} query: {}", tenantId, courseId, query);
        
        // This is where we would do:
        // java.util.List<EmbeddingMatch<TextSegment>> relevant = embeddingStore.findRelevant(...)
        
        // For prototype purposes we return a mock string. The real integration would return the combined text segments.
        return "Relevant context extracted from teacher documents indicating that the query is covered in Lesson 3.";
    }
}
