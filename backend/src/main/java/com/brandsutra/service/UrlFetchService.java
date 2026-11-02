package com.brandsutra.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Service
@Slf4j
public class UrlFetchService {

    private static final int MAX_REDIRECTS = 3;
    private static final int CONNECT_TIMEOUT_MS = 5000;
    private static final int READ_TIMEOUT_MS = 10000;
    private static final int MAX_CONTENT_LENGTH_BYTES = 2 * 1024 * 1024; // 2 MB limit

    private static final Set<Integer> BLOCKED_PORTS = new HashSet<>(Arrays.asList(
            22, 25, 8000, 8080, 3306, 3307, 5432, 6379, 27017, 9200, 9300
    ));

    /**
     * Safely fetches textual content from a public URL, strictly preventing SSRF attacks.
     * Validates DNS resolutions against loopback, private IPv4 (RFC1918), link-local,
     * cloud metadata (169.254.169.254), and internal application ports.
     */
    public String fetchPublicUrlContent(String targetUrl) {
        String currentUrl = targetUrl;
        int redirects = 0;

        while (redirects <= MAX_REDIRECTS) {
            validateUrlSafety(currentUrl);

            HttpURLConnection conn = null;
            try {
                URI uri = URI.create(currentUrl);
                URL url = uri.toURL();
                conn = (HttpURLConnection) url.openConnection();
                conn.setInstanceFollowRedirects(false); // Manually inspect redirects for SSRF
                conn.setConnectTimeout(CONNECT_TIMEOUT_MS);
                conn.setReadTimeout(READ_TIMEOUT_MS);
                conn.setRequestProperty("User-Agent", "BrandSutra-Drift-Sentinel/1.0 (+https://brandsutra.gov)");
                conn.setRequestProperty("Accept", "text/html,text/plain,application/xhtml+xml,application/json;q=0.9");

                int statusCode = conn.getResponseCode();

                // Handle Redirects
                if (statusCode == HttpURLConnection.HTTP_MOVED_PERM
                        || statusCode == HttpURLConnection.HTTP_MOVED_TEMP
                        || statusCode == HttpURLConnection.HTTP_SEE_OTHER
                        || statusCode == 307
                        || statusCode == 308) {

                    String location = conn.getHeaderField("Location");
                    if (location == null || location.isBlank()) {
                        throw new IllegalArgumentException("Redirect response missing Location header");
                    }

                    // Resolve relative redirect URI if needed
                    currentUrl = uri.resolve(location).toString();
                    redirects++;
                    log.info("SSRF Sentinel: Following validated redirect ({}/{}) to {}", redirects, MAX_REDIRECTS, currentUrl);
                    continue;
                }

                if (statusCode < 200 || statusCode >= 300) {
                    throw new RuntimeException("HTTP request failed with status code: " + statusCode);
                }

                // Check content length if available
                long contentLength = conn.getContentLengthLong();
                if (contentLength > MAX_CONTENT_LENGTH_BYTES) {
                    throw new IllegalArgumentException("Response payload exceeds safe maximum limit of 2MB");
                }

                // Read content with size bounding
                try (InputStream in = conn.getInputStream();
                     BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))) {
                    StringBuilder body = new StringBuilder();
                    char[] buffer = new char[4096];
                    int charsRead;
                    int totalRead = 0;

                    while ((charsRead = reader.read(buffer)) != -1) {
                        totalRead += charsRead;
                        if (totalRead > MAX_CONTENT_LENGTH_BYTES) {
                            throw new IllegalArgumentException("Response exceeded safe maximum streaming limit of 2MB");
                        }
                        body.append(buffer, 0, charsRead);
                    }
                    return body.toString();
                }

            } catch (Exception e) {
                log.error("SSRF Sentinel security or fetch error for URL '{}': {}", currentUrl, e.getMessage());
                throw new RuntimeException("Failed to safely fetch content: " + e.getMessage(), e);
            } finally {
                if (conn != null) {
                    conn.disconnect();
                }
            }
        }

        throw new IllegalArgumentException("Exceeded maximum redirect depth of " + MAX_REDIRECTS);
    }

    /**
     * Inspects protocol, host, port, and resolved IP addresses.
     */
    public void validateUrlSafety(String urlString) {
        if (urlString == null || urlString.isBlank()) {
            throw new IllegalArgumentException("URL cannot be empty");
        }

        URI uri;
        try {
            uri = URI.create(urlString.trim());
        } catch (Exception e) {
            throw new IllegalArgumentException("Malformed URL structure: " + urlString);
        }

        String scheme = uri.getScheme();
        if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
            throw new IllegalArgumentException("Only HTTP and HTTPS protocols are permitted for monitoring");
        }

        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            throw new IllegalArgumentException("Invalid host in URL: " + urlString);
        }

        int port = uri.getPort();
        if (port != -1 && BLOCKED_PORTS.contains(port)) {
            throw new IllegalArgumentException("Port " + port + " is restricted by security policy");
        }

        // Resolve DNS and check each IP address
        try {
            InetAddress[] addresses = InetAddress.getAllByName(host);
            for (InetAddress addr : addresses) {
                if (isPrivateOrRestrictedIp(addr)) {
                    throw new SecurityException("SSRF blocked: Host '" + host + "' resolves to forbidden address: " + addr.getHostAddress());
                }
            }
        } catch (UnknownHostException e) {
            throw new IllegalArgumentException("Unable to resolve DNS hostname: " + host);
        }
    }

    private boolean isPrivateOrRestrictedIp(InetAddress addr) {
        if (addr.isLoopbackAddress() || addr.isAnyLocalAddress() || addr.isLinkLocalAddress()) {
            return true;
        }

        if (addr.isSiteLocalAddress()) {
            return true; // Catches 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
        }

        String ip = addr.getHostAddress();

        // AWS / GCP / Azure metadata endpoint
        if (ip.startsWith("169.254.") || ip.equalsIgnoreCase("169.254.169.254")) {
            return true;
        }

        // Carrier-grade NAT (100.64.0.0/10)
        if (ip.startsWith("100.64.") || ip.startsWith("100.127.")) {
            return true;
        }

        // IPv6 Loopback or unique local
        if (ip.equals("0:0:0:0:0:0:0:1") || ip.equals("::1") || ip.toLowerCase().startsWith("fc") || ip.toLowerCase().startsWith("fd")) {
            return true;
        }

        return false;
    }
}

