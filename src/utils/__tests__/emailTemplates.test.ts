import { productInquiryTemplate } from '../emailTemplates';

describe('emailTemplates', () => {
  describe('productInquiryTemplate', () => {
    // SNAPSHOT TESTS - for email template structures
    describe('Email Template Structure Snapshots', () => {
      it('should match snapshot for standard product titles', () => {
        const standardTitles = [
          'iPhone 14 Pro',
          'Samsung Galaxy S23',
          'MacBook Pro 16-inch',
          'Nike Air Jordan 1',
          'Sony WH-1000XM4 Headphones',
          'Tesla Model 3',
          'Apple Watch Series 8',
          'Dell XPS 13 Laptop',
        ];

        const templates = standardTitles.map(title => ({
          productTitle: title,
          template: productInquiryTemplate(title),
        }));

        expect(templates).toMatchSnapshot('standard-product-titles');
      });

      it('should match snapshot for special characters in product titles', () => {
        const specialCharTitles = [
          'Product with "Quotes"',
          "Product with 'Single Quotes'",
          'Product with & Ampersand',
          'Product with < > Brackets',
          'Product with @ Symbol',
          'Product with # Hash',
          'Product with % Percent',
          'Product with $ Dollar',
          'Product with + Plus',
          'Product with = Equals',
          'Product with [] Square Brackets',
          'Product with () Parentheses',
          'Product with | Pipe',
          'Product with \\ Backslash',
          'Product with / Forward Slash',
        ];

        const templates = specialCharTitles.map(title => ({
          productTitle: title,
          template: productInquiryTemplate(title),
        }));

        expect(templates).toMatchSnapshot('special-characters-in-titles');
      });

      it('should match snapshot for international characters and emojis', () => {
        const internationalTitles = [
          'Café Espresso Machine',
          'Señor García\'s Guitar',
          'Château Wine Collection',
          'Naïve Art Painting',
          'Résumé Template Premium',
          'München Beer Stein',
          'Tokyo Ramen Bowl 🍜',
          'Paris Café Croissant 🥐',
          'New York Pizza Slice 🍕',
          'London Tea Set ☕',
          'Product with Ñoño character',
          'Ürün Açıklaması (Turkish)',
          '产品描述 (Chinese)',
          'Описание продукта (Russian)',
          '製品説明 (Japanese)',
        ];

        const templates = internationalTitles.map(title => ({
          productTitle: title,
          template: productInquiryTemplate(title),
        }));

        expect(templates).toMatchSnapshot('international-characters-and-emojis');
      });

      it('should match snapshot for edge case product titles', () => {
        const edgeCaseTitles = [
          '', // Empty string
          ' ', // Single space
          '   ', // Multiple spaces
          '\n', // Newline
          '\t', // Tab
          'A', // Single character
          'A'.repeat(100), // Very long title
          'Product\nWith\nNewlines',
          'Product\tWith\tTabs',
          'Product With    Multiple    Spaces',
          'PRODUCT IN ALL CAPS',
          'product in all lowercase',
          'Product With Mixed CaSe',
          '123456789', // Numbers only
          '!@#$%^&*()', // Special characters only
          'Product-with-hyphens-everywhere',
          'Product_with_underscores_everywhere',
          'Product.with.dots.everywhere',
        ];

        const templates = edgeCaseTitles.map(title => ({
          productTitle: title,
          template: productInquiryTemplate(title),
          titleLength: title.length,
        }));

        expect(templates).toMatchSnapshot('edge-case-product-titles');
      });

      it('should match snapshot for realistic e-commerce product titles', () => {
        const realisticTitles = [
          'Apple iPhone 14 Pro Max 256GB Space Black - Unlocked',
          'Samsung 65" 4K QLED Smart TV with Alexa Built-in (QN65Q70A)',
          'Nike Men\'s Air Max 270 Running Shoes - Size 10.5 - Black/White',
          'Instant Pot Duo 7-in-1 Electric Pressure Cooker, 6 Quart',
          'Dyson V15 Detect Absolute Cordless Vacuum Cleaner',
          'KitchenAid Professional 600 Series 6-Quart Stand Mixer - Silver',
          'Sony WH-1000XM5 Wireless Noise Canceling Headphones - Black',
          'The North Face Men\'s Thermoball Eco Jacket - Large - Navy',
          'Canon EOS R5 Mirrorless Camera with 24-105mm f/4L Lens Kit',
          'Herman Miller Aeron Chair - Size B - Graphite Frame',
        ];

        const templates = realisticTitles.map(title => ({
          productTitle: title,
          template: productInquiryTemplate(title),
          subjectLength: productInquiryTemplate(title).subject.length,
          bodyLength: productInquiryTemplate(title).body.length,
        }));

        expect(templates).toMatchSnapshot('realistic-ecommerce-titles');
      });

      it('should match snapshot for template structure analysis', () => {
        const testTitle = 'Sample Product for Structure Analysis';
        const template = productInquiryTemplate(testTitle);

        const structureAnalysis = {
          template,
          subjectStructure: {
            prefix: 'Intrested with your product: ',
            productTitlePlaceholder: testTitle,
            totalLength: template.subject.length,
            hasTypo: template.subject.includes('Intrested'), // Note: "Interested" is misspelled
          },
          bodyStructure: {
            greeting: 'Hello,',
            firstLine: `I'm interested in your product "${testTitle}".`,
            secondLine: 'Could you please provide more information?',
            closing: 'Best regards,',
            newlineCount: (template.body.match(/\n/g) || []).length,
            totalLength: template.body.length,
            hasProductTitleInQuotes: template.body.includes(`"${testTitle}"`),
          },
          templateKeys: Object.keys(template),
          templateValues: Object.values(template),
        };

        expect(structureAnalysis).toMatchSnapshot('template-structure-analysis');
      });
    });

    // UNIT TESTS - for behavior and functionality
    describe('Template Generation Behavior', () => {
      it('should generate correct subject with product title', () => {
        const productTitle = 'Test Product';
        const result = productInquiryTemplate(productTitle);
        
        expect(result.subject).toBe('Intrested with your product: Test Product');
      });

      it('should generate correct body with product title', () => {
        const productTitle = 'Test Product';
        const result = productInquiryTemplate(productTitle);
        
        const expectedBody = 'Hello,\n\nI\'m interested in your product "Test Product". Could you please provide more information?\n\nBest regards,';
        expect(result.body).toBe(expectedBody);
      });

      it('should return object with subject and body properties', () => {
        const result = productInquiryTemplate('Any Product');
        
        expect(result).toHaveProperty('subject');
        expect(result).toHaveProperty('body');
        expect(typeof result.subject).toBe('string');
        expect(typeof result.body).toBe('string');
      });

      it('should handle empty string product title', () => {
        const result = productInquiryTemplate('');
        
        expect(result.subject).toBe('Intrested with your product: ');
        expect(result.body).toBe('Hello,\n\nI\'m interested in your product "". Could you please provide more information?\n\nBest regards,');
      });

      it('should preserve special characters in product title', () => {
        const specialTitle = 'Product with "quotes" & <symbols>';
        const result = productInquiryTemplate(specialTitle);
        
        expect(result.subject).toContain(specialTitle);
        expect(result.body).toContain(`"${specialTitle}"`);
      });

      it('should handle very long product titles', () => {
        const longTitle = 'A'.repeat(1000);
        const result = productInquiryTemplate(longTitle);
        
        expect(result.subject).toContain(longTitle);
        expect(result.body).toContain(`"${longTitle}"`);
        expect(result.subject.length).toBeGreaterThan(1000);
        expect(result.body.length).toBeGreaterThan(1000);
      });

      it('should handle newlines and tabs in product title', () => {
        const titleWithWhitespace = 'Product\nWith\nNewlines\tAnd\tTabs';
        const result = productInquiryTemplate(titleWithWhitespace);
        
        expect(result.subject).toContain(titleWithWhitespace);
        expect(result.body).toContain(`"${titleWithWhitespace}"`);
      });

      it('should maintain consistent template structure regardless of input', () => {
        const testTitles = [
          'Normal Product',
          '',
          'Product with special chars: !@#$%^&*()',
          'Very'.repeat(100),
          '   Spaces   ',
        ];

        testTitles.forEach(title => {
          const result = productInquiryTemplate(title);
          
          // Should always have same structure
          expect(result.subject.startsWith('Intrested with your product: ')).toBe(true);
          expect(result.body.startsWith('Hello,\n\n')).toBe(true);
          expect(result.body).toContain('I\'m interested in your product');
          expect(result.body).toContain('Could you please provide more information?');
          expect(result.body.endsWith('\n\nBest regards,')).toBe(true);
        });
      });
    });

    describe('Template Content Validation', () => {
      it('should contain all required email elements', () => {
        const result = productInquiryTemplate('Test Product');
        
        // Subject validation
        expect(result.subject).toMatch(/^Intrested with your product: .+/);
        
        // Body validation
        expect(result.body).toContain('Hello,');
        expect(result.body).toContain('I\'m interested in your product');
        expect(result.body).toContain('Could you please provide more information?');
        expect(result.body).toContain('Best regards,');
      });

      it('should have proper email formatting', () => {
        const result = productInquiryTemplate('Test Product');
        
        // Check for proper line breaks
        const bodyLines = result.body.split('\n');
        expect(bodyLines).toHaveLength(5); // Hello, empty, content, empty, closing
        expect(bodyLines[0]).toBe('Hello,');
        expect(bodyLines[1]).toBe('');
        expect(bodyLines[3]).toBe('');
        expect(bodyLines[4]).toBe('Best regards,');
      });

      it('should properly quote product title in body', () => {
        const productTitle = 'Quoted Product';
        const result = productInquiryTemplate(productTitle);
        
        expect(result.body).toContain(`"${productTitle}"`);
        expect(result.body).toMatch(new RegExp(`"${productTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
      });

      it('should not have subject line longer than reasonable email limits', () => {
        // Most email clients truncate subjects around 50-70 characters
        const normalTitle = 'Normal Product Title';
        const result = productInquiryTemplate(normalTitle);
        
        // For normal titles, should be reasonable length
        expect(result.subject.length).toBeLessThan(100);
      });
    });

    describe('Template Consistency', () => {
      it('should produce identical results for identical inputs', () => {
        const title = 'Consistency Test Product';
        
        const result1 = productInquiryTemplate(title);
        const result2 = productInquiryTemplate(title);
        
        expect(result1).toEqual(result2);
        expect(result1.subject).toBe(result2.subject);
        expect(result1.body).toBe(result2.body);
      });

      it('should produce different results for different inputs', () => {
        const title1 = 'Product A';
        const title2 = 'Product B';
        
        const result1 = productInquiryTemplate(title1);
        const result2 = productInquiryTemplate(title2);
        
        expect(result1).not.toEqual(result2);
        expect(result1.subject).not.toBe(result2.subject);
        expect(result1.body).not.toBe(result2.body);
      });

      it('should handle case sensitivity correctly', () => {
        const lowerCase = 'test product';
        const upperCase = 'TEST PRODUCT';
        const mixedCase = 'Test Product';
        
        const result1 = productInquiryTemplate(lowerCase);
        const result2 = productInquiryTemplate(upperCase);
        const result3 = productInquiryTemplate(mixedCase);
        
        expect(result1.subject).toContain(lowerCase);
        expect(result2.subject).toContain(upperCase);
        expect(result3.subject).toContain(mixedCase);
        
        // All should be different
        expect(result1.subject).not.toBe(result2.subject);
        expect(result2.subject).not.toBe(result3.subject);
        expect(result1.subject).not.toBe(result3.subject);
      });
    });

    describe('Edge Cases and Error Handling', () => {
      it('should handle undefined input gracefully', () => {
        // TypeScript would prevent this, but testing runtime behavior
        const result = productInquiryTemplate(undefined as any);
        
        expect(result.subject).toContain('undefined');
        expect(result.body).toContain('"undefined"');
      });

      it('should handle null input gracefully', () => {
        // TypeScript would prevent this, but testing runtime behavior
        const result = productInquiryTemplate(null as any);
        
        expect(result.subject).toContain('null');
        expect(result.body).toContain('"null"');
      });

      it('should handle numeric input gracefully', () => {
        // TypeScript would prevent this, but testing runtime behavior
        const result = productInquiryTemplate(123 as any);
        
        expect(result.subject).toContain('123');
        expect(result.body).toContain('"123"');
      });

      it('should handle boolean input gracefully', () => {
        // TypeScript would prevent this, but testing runtime behavior
        const result = productInquiryTemplate(true as any);
        
        expect(result.subject).toContain('true');
        expect(result.body).toContain('"true"');
      });

      it('should handle object input gracefully', () => {
        // TypeScript would prevent this, but testing runtime behavior
        const result = productInquiryTemplate({ name: 'product' } as any);
        
        expect(result.subject).toContain('[object Object]');
        expect(result.body).toContain('"[object Object]"');
      });
    });
  });
});