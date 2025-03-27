/**
 * Email Processing Web Worker
 * 
 * Performs background processing of email data to offload the main thread.
 * This includes encryption/decryption, parsing, and other CPU-intensive tasks.
 */

// Self-contained implementation of encryption
// Note: In production, consider using the Web Crypto API for better security
const cryptoUtils = {
  // Simple encryption using XOR with a key
  // This is just for demo purposes - use proper crypto in production
  encrypt: (text, key) => {
    if (!text || !key) return '';
    
    // Convert to an array of character codes and apply XOR with key
    return Array.from(text)
      .map((char, index) => {
        const keyChar = key.charCodeAt(index % key.length);
        return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
      })
      .join('');
  },
  
  decrypt: (encrypted, key) => {
    if (!encrypted || !key) return '';
    // XOR is symmetric, so encryption and decryption are the same operation
    return cryptoUtils.encrypt(encrypted, key);
  },
  
  // Generate a hash of the content (simplified version)
  hash: (content) => {
    if (!content) return '';
    
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
};

// Email content parsing
const emailParser = {
  // Extract links from an email body
  extractLinks: (body) => {
    if (!body) return [];
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return body.match(urlRegex) || [];
  },
  
  // Check if email contains sensitive information patterns
  checkSensitiveContent: (body) => {
    if (!body) return { containsSensitive: false, patterns: [] };
    
    const patterns = [
      { name: 'credit_card', regex: /\b(?:\d[ -]*?){13,16}\b/ },
      { name: 'phone_br', regex: /\(\d{2}\)\s*\d{4,5}[-. ]?\d{4}/ },
      { name: 'cpf', regex: /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/ },
      { name: 'email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/ }
    ];
    
    const matches = [];
    
    for (const pattern of patterns) {
      if (pattern.regex.test(body)) {
        matches.push(pattern.name);
      }
    }
    
    return {
      containsSensitive: matches.length > 0,
      patterns: matches
    };
  },
  
  // Generate a preview of the email (first n characters)
  generatePreview: (body, length = 100) => {
    if (!body) return '';
    
    // Remove HTML tags for the preview
    const textOnly = body.replace(/<[^>]*>/g, ' ');
    const cleaned = textOnly.replace(/\s+/g, ' ').trim();
    
    if (cleaned.length <= length) {
      return cleaned;
    }
    
    return cleaned.substring(0, length) + '...';
  }
};

// Handle messages from the main thread
self.onmessage = function(event) {
  try {
    const { id, type, payload } = event.data;
    
    let result;
    
    switch (type) {
      case 'ENCRYPT_DATA':
        result = cryptoUtils.encrypt(payload.data, payload.key);
        break;
        
      case 'DECRYPT_DATA':
        result = cryptoUtils.decrypt(payload.data, payload.key);
        break;
        
      case 'PARSE_EMAIL':
        // Process email content
        const { body } = payload;
        result = {
          preview: emailParser.generatePreview(body),
          links: emailParser.extractLinks(body),
          sensitiveCheck: emailParser.checkSensitiveContent(body),
          hash: cryptoUtils.hash(body)
        };
        break;
        
      case 'BENCHMARK':
        // Run a CPU-intensive task to test performance
        result = runBenchmark(payload.iterations || 1000000);
        break;
        
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
    
    // Send the result back to the main thread
    self.postMessage({
      id,
      type,
      result
    });
  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      id: event.data.id,
      type: event.data.type,
      error: error.message || 'Unknown error in worker'
    });
  }
};

// CPU-intensive function for benchmarking
function runBenchmark(iterations) {
  const start = performance.now();
  
  let result = 0;
  for (let i = 0; i < iterations; i++) {
    result += Math.sin(i) * Math.cos(i);
  }
  
  const end = performance.now();
  
  return {
    duration: end - start,
    iterations,
    result
  };
}

// Signal that the worker is ready
self.postMessage({
  id: 'INIT',
  type: 'WORKER_READY',
  result: {
    timestamp: Date.now(),
    features: ['encryption', 'parsing', 'benchmarking']
  }
}); 