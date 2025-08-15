package com.example.E_commerceStore.WebApp.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class SameSiteCookieFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        chain.doFilter(request, response);
        if (response instanceof HttpServletResponse resp) {
            for (String header : resp.getHeaders("Set-Cookie")) {
                if (header.startsWith("JSESSIONID")) {
                    resp.setHeader("Set-Cookie", header + "; SameSite=None; Secure");
                }
            }
        }
    }
}
