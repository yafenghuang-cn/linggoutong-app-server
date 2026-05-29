package com.linggoutong.config;

import com.linggoutong.annotation.NoAuth;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.io.IOException;
import java.util.List;

/**
 * NoAuth 过滤器 - 在认证阶段处理 @NoAuth 注解
 * 对于带有 @NoAuth 注解的接口，设置匿名认证，跳过 JWT 验证
 */
@Component
public class NoAuthFilter extends OncePerRequestFilter {

    private final RequestMappingHandlerMapping handlerMapping;

    public NoAuthFilter(RequestMappingHandlerMapping handlerMapping) {
        this.handlerMapping = handlerMapping;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            // 获取请求对应的 handler
            var chain = handlerMapping.getHandler(request);
            if (chain != null && chain.getHandler() instanceof HandlerMethod handlerMethod) {
                // 检查方法或类上是否有 @NoAuth 注解
                if (handlerMethod.getMethodAnnotation(NoAuth.class) != null ||
                    handlerMethod.getBeanType().isAnnotationPresent(NoAuth.class)) {
                    // 设置匿名认证，跳过 JWT 验证
                    var authorities = List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS"));
                    var anonymousAuth = new AnonymousAuthenticationToken("noAuth", "anonymous", authorities);
                    SecurityContextHolder.getContext().setAuthentication(anonymousAuth);
                }
            }
        } catch (Exception e) {
            // 获取 handler 失败，继续后续流程
        }

        filterChain.doFilter(request, response);
    }
}
