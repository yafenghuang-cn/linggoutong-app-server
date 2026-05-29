package com.linggoutong.config;

import com.linggoutong.annotation.NoAuth;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerExecutionChain;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.function.Supplier;

@Component
public class NoAuthAuthorizationManager implements AuthorizationManager<RequestAuthorizationContext> {

    private final RequestMappingHandlerMapping handlerMapping;

    public NoAuthAuthorizationManager(RequestMappingHandlerMapping handlerMapping) {
        this.handlerMapping = handlerMapping;
    }

    @Override
    public AuthorizationDecision check(Supplier<Authentication> authentication, RequestAuthorizationContext context) {
        HttpServletRequest request = context.getRequest();

        try {
            // 通过 HandlerMapping 获取对应的 handler
            HandlerExecutionChain chain = handlerMapping.getHandler(request);
            if (chain != null && chain.getHandler() instanceof HandlerMethod handlerMethod) {
                // 检查方法或类上是否有 @NoAuth 注解
                if (handlerMethod.getMethodAnnotation(NoAuth.class) != null ||
                    handlerMethod.getBeanType().isAnnotationPresent(NoAuth.class)) {
                    return new AuthorizationDecision(true);
                }
            }
        } catch (Exception e) {
            // 获取 handler 失败，继续后续认证流程
        }

        // 默认需要认证
        return new AuthorizationDecision(false);
    }
}
