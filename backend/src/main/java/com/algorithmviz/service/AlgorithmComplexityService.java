package com.algorithmviz.service;

import com.algorithmviz.dto.AlgorithmComplexityRequest;
import com.algorithmviz.model.AlgorithmComplexityAnalysis;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class AlgorithmComplexityService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${ai.complexity.api-url}")
    private String apiUrl;

    @Value("${ai.complexity.api-key}")
    private String apiKey;

    @Value("${ai.complexity.model}")
    private String model;

    public AlgorithmComplexityService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    public AlgorithmComplexityAnalysis analyze(AlgorithmComplexityRequest request) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("AI_COMPLEXITY_API_KEY 未配置");
        }

        String prompt = buildPrompt(request);

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content", "你是算法复杂度分析助手。请严格分析算法的时间复杂度和空间复杂度。"
                        ),
                        Map.of(
                                "role", "user",
                                "content", prompt
                        )
                ),
                "temperature", 0.2,
                "response_format", Map.of("type", "json_object")
        );

        String response = restClient.post()
                .uri(apiUrl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);

        return parseResponse(response);
    }

    private String buildPrompt(AlgorithmComplexityRequest request) {
        return """
                请分析下面用户自定义算法的时间复杂度和空间复杂度。

                用户输入语言类型：%s
                用户关注场景：%s

                请只返回 JSON，格式如下：
                {
                  "timeComplexityWorst": "O(...)",
                  "timeComplexityAverage": "O(...)",
                  "timeComplexityBest": "O(...)",
                  "spaceComplexity": "O(...)",
                  "reasoningSteps": ["..."],
                  "assumptions": ["..."],
                  "optimizationSuggestions": ["..."],
                  "confidence": 0.0
                }

                分析要求：
                1. 识别循环、嵌套循环、递归、分治、动态规划、图遍历等结构。
                2. 如果是递归，请给出递推关系。
                3. 如果输入信息不足，请在 assumptions 中写明假设。
                4. confidence 取值范围为 0 到 1。
                5. 不要输出 Markdown，不要输出 JSON 以外的文本。

                用户算法如下：
                %s
                """.formatted(
                safe(request.getLanguage()),
                safe(request.getCaseType()),
                request.getCode()
        );
    }

    private AlgorithmComplexityAnalysis parseResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            String content = root.path("choices")
                    .path(0)
                    .path("message")
                    .path("content")
                    .asText();

            JsonNode json = objectMapper.readTree(content);

            return AlgorithmComplexityAnalysis.builder()
                    .timeComplexityWorst(json.path("timeComplexityWorst").asText("无法判断"))
                    .timeComplexityAverage(json.path("timeComplexityAverage").asText("无法判断"))
                    .timeComplexityBest(json.path("timeComplexityBest").asText("无法判断"))
                    .spaceComplexity(json.path("spaceComplexity").asText("无法判断"))
                    .reasoningSteps(toStringList(json.path("reasoningSteps")))
                    .assumptions(toStringList(json.path("assumptions")))
                    .optimizationSuggestions(toStringList(json.path("optimizationSuggestions")))
                    .confidence(json.path("confidence").asDouble(0.5))
                    .rawText(content)
                    .build();
        } catch (Exception e) {
            return AlgorithmComplexityAnalysis.builder()
                    .timeComplexityWorst("解析失败")
                    .timeComplexityAverage("解析失败")
                    .timeComplexityBest("解析失败")
                    .spaceComplexity("解析失败")
                    .reasoningSteps(List.of("AI 返回结果解析失败：" + e.getMessage()))
                    .assumptions(List.of("请检查 AI 服务返回格式是否为 JSON"))
                    .optimizationSuggestions(List.of())
                    .confidence(0.0)
                    .rawText(response)
                    .build();
        }
    }

    private List<String> toStringList(JsonNode node) {
        if (node == null || !node.isArray()) {
            return List.of();
        }

        return objectMapper.convertValue(
                node,
                objectMapper.getTypeFactory().constructCollectionType(List.class, String.class)
        );
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "未指定" : value;
    }
}
