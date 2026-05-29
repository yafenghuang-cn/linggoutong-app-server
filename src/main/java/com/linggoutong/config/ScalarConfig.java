package com.linggoutong.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Scalar UI 配置 - 提供现代化的 API 文档界面
 * 类似于 NestJS 的 @scalar/nestjs-api-reference
 */
@Controller
public class ScalarConfig {

    /**
     * Scalar UI 页面 - 访问 /api-docs 时返回 Scalar UI 界面
     */
    @GetMapping("/api-docs")
    @ResponseBody
    public String getScalarUi() {
        return """
                <!DOCTYPE html>
                <html lang="zh-CN">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>领购通 API 文档</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                        }
                    </style>
                </head>
                <body>
                    <script
                        id="api-reference"
                        data-url="/v3/api-docs"
                        data-configuration='{"theme":"default","layout":"modern","defaultHttpClient":{"targetKey":"js","clientKey":"axios"}}'>
                    </script>
                    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
                </body>
                </html>
                """;
    }

    /**
     * 重定向 /api-docs.html 到 /api-docs
     */
    @GetMapping("/api-docs.html")
    public String redirect() {
        return "redirect:/api-docs";
    }
}
