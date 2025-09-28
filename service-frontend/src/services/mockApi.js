// Mock API for development purposes
export const mockReportAPI = {
  // Mock upload report
  uploadReport: async (file, options = {}) => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      reportId: 'mock-report-' + Date.now(),
      message: 'File uploaded successfully',
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    };
  },

  // Mock get summary
  getSummary: async (reportId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        reportId,
        title: 'AI Rapor Analizi - Aralık 2024',
        summary: `Bu rapor analizi, işletmenizin Aralık 2024 performansını kapsamlı bir şekilde değerlendirmektedir. 
        
Genel olarak, tüm ana metriklerde güçlü bir performans sergilenmiştir. Toplam gelir ₺2,450,000'a ulaşarak önceki aya göre %18.5 artış göstermiştir. Aktif müşteri sayısı 15,847'ye çıkarak %12.3'lük bir büyüme kaydedilmiştir.

Özellikle dikkat çeken noktalar:
• E-ticaret kanalında %24.1 büyüme
• Müşteri memnuniyet skorunun 4.6/5'e yükselmesi  
• Ortalama sipariş tutarının ₺154'e çıkması
• Dönüşüm oranının hafif düşüşü (%4.8)

AI analizi, mevcut trendin sürdürülebilir olduğunu ve 2025 Q1 için pozitif bir görünüm sunduğunu göstermektedir.`,
        generatedAt: new Date().toISOString(),
        insights: [
          'Gelir hedefinin %118.5 üzerinde gerçekleşmesi',
          'Müşteri kazanım maliyetinde %15 azalma',
          'Mobil kanal kullanımında %67 artış',
          'Premium segment müşterilerinde %28 büyüme',
          'Müşteri yaşam boyu değerinde ortalama %22 artış'
        ],
        recommendations: [
          'Dönüşüm oranını artırmak için checkout sürecini optimize edin',
          'Müşteri segmentasyonu ile kişiselleştirilmiş kampanyalar geliştirin',
          'Mobil uygulama deneyimini geliştirerek mobil satışları artırın',
          'Premium müşteri programını genişleterek sadakati artırın'
        ]
      }
    };
  },

  // Mock get KPIs
  getKPIs: async (reportId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      kpi: {
        total_subscribers: 263264,
        county_distribution: {
          "ADALAR": 517,
          "ARNAVUTKÖY": 443,
          "ATAŞEHİR": 609,
          "AVCILAR": 3702,
          "BAHÇELİEVLER": 3446,
          "BAKIRKÖY": 12050,
          "BAYRAMPAŞA": 1441,
          "BAĞCILAR": 3138,
          "BAŞAKŞEHİR": 894,
          "BEYKOZ": 1256,
          "BEYLİKDÜZÜ": 2738,
          "BEYOĞLU": 23086,
          "BEŞİKTAŞ": 6355,
          "BÜYÜKÇEKMECE": 267,
          "ESENLER": 9251,
          "ESENYURT": 478,
          "EYÜP SULTAN": 10845,
          "EYÜPSULTAN": 6995,
          "FATİH": 49239,
          "GAZİOSMANPAŞA": 3243,
          "GÜNGÖREN": 2178,
          "KADIKÖY": 8136,
          "KARTAL": 7126,
          "KAĞITHANE": 3048,
          "KÜÇÜKÇEKMECE": 14526,
          "MALTEPE": 21954,
          "PENDİK": 3260,
          "SANCAKTEPE": 9673,
          "SARIYER": 5732,
          "SULTANBEYLİ": 3508,
          "SULTANGAZİ": 3946,
          "SİLİVRİ": 474,
          "TUZLA": 706,
          "ZEYTİNBURNU": 9002,
          "ÇATALCA": 887,
          "ÇEKMEKÖY": 862,
          "ÜMRANİYE": 5648,
          "ÜSKÜDAR": 8758,
          "İSTANBUL": 6358,
          "ŞİLE": 1989,
          "ŞİŞLİ": 5500
        },
        domestic_foreign_distribution: {
          "Bilinmiyor": 44,
          "Yabancı": 54712,
          "Yerli": 208508
        }
      }
    };
  },

  // Mock get trends
  getTrends: async (reportId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      trend: {
        "2015-11-05": 1,
        "2015-11-11": 1,
        "2015-11-14": 2,
        "2015-11-15": 2,
        "2015-11-16": 1,
        "2015-11-17": 1,
        "2015-11-20": 4,
        "2015-11-21": 2,
        "2015-11-22": 15,
        "2015-11-23": 6,
        "2015-11-24": 7,
        "2015-11-25": 4,
        "2015-11-26": 2,
        "2015-11-27": 6,
        "2021-05-19": 125
      }
    };
  },

  // Mock get insights
  getInsights: async (reportId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      insights: [
        "En çok abone FATİH ilçesinde bağlandı.",
        "En yoğun tarih 2021-05-19 oldu."
      ]
    };
  },

  // Mock get actions
  getActions: async (reportId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      actions: [
        "FATİH ilçesindeki yüksek abone sayısını analiz edin",
        "2021-05-19 tarihindeki yoğunluğun nedenlerini araştırın",
        "Yabancı abone oranını artırmak için stratejiler geliştirin",
        "En düşük abone sayısına sahip ilçeler için kampanyalar planlayın"
      ]
    };
  },

  // Mock query report
  queryReport: async (query, reportId = null) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Smart responses based on query content
    let answer = '';
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('revenue') || lowerQuery.includes('sales') || lowerQuery.includes('income')) {
      answer = `Revenue Analysis: Over the last 12 months, total revenue has increased by 89%. December achieved a record high of $340,000. The trend is positive and growth appears sustainable.`;
    } else if (lowerQuery.includes('customer') || lowerQuery.includes('user') || lowerQuery.includes('client')) {
      answer = `Customer Analysis: Active customer count reached 15,847. Customer satisfaction score is 4.6/5. New customer acquisition shows a 12.3% increase.`;
    } else if (lowerQuery.includes('trend') || lowerQuery.includes('growth') || lowerQuery.includes('performance')) {
      answer = `Trend Analysis: Overall growth trend is highly positive. Monthly growth rate of 24.1% exceeds targets and shows strong performance.`;
    } else if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest') || lowerQuery.includes('advice')) {
      answer = `AI Recommendations: 1) Implement A/B testing to improve conversion rates 2) Develop customer segmentation for personalized campaigns 3) Optimize mobile experience for better engagement`;
    } else if (lowerQuery.includes('conversion') || lowerQuery.includes('rate')) {
      answer = `Conversion Analysis: Current conversion rate is 4.8% with a slight decline of 1.2%. Consider optimizing the checkout process and improving product page layouts.`;
    } else {
      answer = `Analysis for "${query}": Current data shows positive trends across key metrics. For more detailed insights, please ask more specific questions about revenue, customers, or performance.`;
    }
    
    return {
      success: true,
      data: {
        query,
        reportId,
        answer,
        confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0 arası
        sources: ['Revenue Table', 'Customer Data', 'Trend Analysis', 'AI Model v2.1']
      }
    };
  },

  // Mock get reports
  getReports: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: {
        reports: [
          {
            id: 'mock-report-1',
            name: '2024 Q4 Sales Report.pdf',
            uploadedAt: new Date(Date.now() - 86400000).toISOString(),
            size: 2456789,
            status: 'processed',
            type: 'PDF',
            description: 'Quarterly sales performance analysis'
          },
          {
            id: 'mock-report-2', 
            name: 'Customer Analytics December.xlsx',
            uploadedAt: new Date(Date.now() - 172800000).toISOString(),
            size: 1234567,
            status: 'processed',
            type: 'Excel',
            description: 'Customer behavior and segmentation analysis'
          },
          {
            id: 'mock-report-3', 
            name: 'E-commerce Performance.csv',
            uploadedAt: new Date(Date.now() - 259200000).toISOString(),
            size: 987654,
            status: 'processed',
            type: 'CSV',
            description: 'Online channel performance metrics'
          },
          {
            id: 'mock-report-4', 
            name: 'Marketing ROI Analysis.pdf',
            uploadedAt: new Date(Date.now() - 345600000).toISOString(),
            size: 3456789,
            status: 'processed',
            type: 'PDF',
            description: 'Digital marketing campaign results'
          }
        ],
        total: 4
      }
    };
  }
};
