package com.algorithmviz.controller;

import com.algorithmviz.dto.*;
import com.algorithmviz.entity.RunHistory;
import com.algorithmviz.model.*;
import com.algorithmviz.repository.RunHistoryRepository;
import com.algorithmviz.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/algorithms")
public class AlgorithmController {

    private final SortingService sortingService;
    private final SearchService searchService;
    private final GraphService graphService;
    private final DPService dpService;
    private final BacktrackingService backtrackingService;
    private final DivideConquerService divideConquerService;
    private final RunHistoryRepository historyRepository;
    private final ObjectMapper objectMapper;

    public AlgorithmController(SortingService sortingService, SearchService searchService,
            GraphService graphService, DPService dpService, BacktrackingService backtrackingService,
            DivideConquerService divideConquerService,
            RunHistoryRepository historyRepository, ObjectMapper objectMapper) {
        this.sortingService = sortingService;
        this.searchService = searchService;
        this.graphService = graphService;
        this.dpService = dpService;
        this.backtrackingService = backtrackingService;
        this.divideConquerService = divideConquerService;
        this.historyRepository = historyRepository;
        this.objectMapper = objectMapper;
    }

    // ==================== SORTING ====================
    @PostMapping("/sort")
    public ResponseEntity<Map<String, Object>> sort(@Valid @RequestBody SortRequest req) throws Exception {
        long start = System.currentTimeMillis();
        List<SortStep> steps = sortingService.generateSteps(req.getAlgorithm(), req.getArray());
        long elapsed = System.currentTimeMillis() - start;

        SortStep last = steps.get(steps.size() - 1);
        saveHistory("sorting", req.getAlgorithm(), objectMapper.writeValueAsString(req),
                steps.size(), last.getComparisons(), last.getSwaps(), elapsed);

        return ok(steps, steps.size(), last.getComparisons(), last.getSwaps(), elapsed);
    }

    // ==================== SEARCH ====================
    @PostMapping("/search")
    public ResponseEntity<Map<String, Object>> search(@Valid @RequestBody SearchRequest req) throws Exception {
        long start = System.currentTimeMillis();
        List<SearchStep> steps = searchService.generateSteps(req.getAlgorithm(), req.getArray(), req.getTarget());
        long elapsed = System.currentTimeMillis() - start;

        SearchStep last = steps.get(steps.size() - 1);
        saveHistory("search", req.getAlgorithm(), objectMapper.writeValueAsString(req),
                steps.size(), last.getComparisons(), 0, elapsed);

        return ok(steps, steps.size(), last.getComparisons(), 0, elapsed);
    }

    // ==================== GRAPH ====================
    @PostMapping("/graph")
    public ResponseEntity<Map<String, Object>> graph(@Valid @RequestBody GraphRequest req) throws Exception {
        long start = System.currentTimeMillis();
        List<GraphStep> steps = graphService.generateSteps(
                req.getAlgorithm(), req.getGraph(), req.getStartId(), req.getEndId());
        long elapsed = System.currentTimeMillis() - start;

        GraphStep last = steps.get(steps.size() - 1);
        saveHistory("graph", req.getAlgorithm(), objectMapper.writeValueAsString(req),
                steps.size(), last.getComparisons(), 0, elapsed);

        return ok(steps, steps.size(), last.getComparisons(), 0, elapsed);
    }

    // ==================== DYNAMIC PROGRAMMING ====================
    @PostMapping("/dp")
    public ResponseEntity<Map<String, Object>> dp(@Valid @RequestBody DPRequest req) throws Exception {
        long start = System.currentTimeMillis();
        List<DPStep> steps = dpService.generateSteps(req.getAlgorithm(), req.getItems(), req.getCapacity());
        long elapsed = System.currentTimeMillis() - start;

        DPStep last = steps.get(steps.size() - 1);
        saveHistory("dp", req.getAlgorithm(), objectMapper.writeValueAsString(req),
                steps.size(), last.getComparisons(), 0, elapsed);

        return ok(steps, steps.size(), last.getComparisons(), 0, elapsed);
    }

    // ==================== BACKTRACKING ====================
    @PostMapping("/backtracking")
    public ResponseEntity<Map<String, Object>> backtracking(@Valid @RequestBody BacktrackingRequest req) throws Exception {
        long start = System.currentTimeMillis();
        List<NQueensStep> steps = backtrackingService.generateSteps(req.getAlgorithm(), req.getN());
        long elapsed = System.currentTimeMillis() - start;

        NQueensStep last = steps.get(steps.size() - 1);
        saveHistory("backtracking", req.getAlgorithm(), objectMapper.writeValueAsString(req),
                steps.size(), 0, last.getBacktracks(), elapsed);

        return ok(steps, steps.size(), 0, last.getBacktracks(), elapsed);
    }

    // ==================== DIVIDE & CONQUER ====================
    @PostMapping("/divide-conquer")
    public ResponseEntity<Map<String, Object>> divideConquer(@Valid @RequestBody DivideConquerRequest req) throws Exception {
        long start = System.currentTimeMillis();
        List<DivideConquerStep> steps = divideConquerService.generateSteps(req.getAlgorithm(), req.getX(), req.getY());
        long elapsed = System.currentTimeMillis() - start;

        DivideConquerStep last = steps.get(steps.size() - 1);
        saveHistory("divide-conquer", req.getAlgorithm(), objectMapper.writeValueAsString(req),
                steps.size(), last.getMultiplications(), last.getAdditions(), elapsed);

        return ok(steps, steps.size(), last.getMultiplications(), last.getAdditions(), elapsed);
    }

    // ==================== HISTORY ====================
    @GetMapping("/history")
    public ResponseEntity<List<RunHistory>> getHistory(
            @RequestParam(required = false) String category) {
        List<RunHistory> history = (category != null && !category.isBlank())
                ? historyRepository.findByCategoryOrderByCreatedAtDesc(category)
                : historyRepository.findTop20ByOrderByCreatedAtDesc();
        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<Void> deleteHistory(@PathVariable Long id) {
        historyRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== HEALTH ====================
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "Algorithm Viz Backend"));
    }

    // ==================== HELPERS ====================
    private void saveHistory(String category, String algorithm, String inputData,
                              int stepCount, int comparisons, int swaps, long elapsedMs) {
        RunHistory h = new RunHistory();
        h.setCategory(category);
        h.setAlgorithm(algorithm);
        h.setInputData(inputData);
        h.setStepCount(stepCount);
        h.setComparisons(comparisons);
        h.setSwaps(swaps);
        h.setExecutionTimeMs(elapsedMs);
        historyRepository.save(h);
    }

    private ResponseEntity<Map<String, Object>> ok(Object steps, int stepCount,
                                                    int comparisons, int extra, long elapsed) {
        Map<String, Object> body = new HashMap<>();
        body.put("steps", steps);
        body.put("stepCount", stepCount);
        body.put("comparisons", comparisons);
        body.put("extra", extra);
        body.put("executionTimeMs", elapsed);
        return ResponseEntity.ok(body);
    }
}
