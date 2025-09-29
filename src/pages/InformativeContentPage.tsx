import React, { useState } from 'react';
import SidebarComponents from '../components/SidebarComponents';
import Header from '../components/HeaderComponent';
import InformativeContentHeader from '../components/InformativeContentComponents/InformativeContentHeader';
import ContentFilter from '../components/InformativeContentComponents/ContentFilter';
import ContentCard, { type Article } from '../components/InformativeContentComponents/ArticleCard';
import ArticleDetailView from '@/components/InformativeContentComponents/ArticleView';
import article from '@/assets/article1.png';

// Mock data for the informative content
// In a real application, you would fetch this data from an API
const articles: Article[] = [
  {
    image: article,
    title: 'The Importance of Prenatal Care for Every Mother',
    status: 'Posted',
    description: 'Regular prenatal check-ups help monitor both the mother’s and baby’s health, ensuring early detection of potential risks. These visits also provide mothers with guidance on n...',
    publishedDate: 'August 1, 2025',
    source: 'Mayo Clinic',
    fetchedDate: 'August 2, 2025',
  },
    {
    image: article,
    title: 'Understanding Postpartum Depression and How to Cope',
    status: 'Posted',
    description: 'Postpartum depression is a common but serious condition that affects many new mothers. Learn about the symptoms, risk factors, and effective coping strategies to navigate th...',
    publishedDate: 'July 28, 2025',
    source: 'WebMD',
    fetchedDate: 'July 29, 2025',
  },
  {
    image: article,
    title: 'Nutritional Needs During Pregnancy: A Comprehensive Guide',
    status: 'Archived',
    description: 'A healthy diet is crucial for a healthy pregnancy. This article covers the essential nutrients, vitamins, and minerals you need, along with foods to eat and avoid for the well-b...',
    publishedDate: 'July 15, 2025',
    source: 'Healthline',
    fetchedDate: 'July 16, 2025',
  },
  {
    image: article,
    title: 'The Stages of Labor: What to Expect When You\'re Expecting',
    status: 'Posted',
    description: 'From early labor to the delivery of your baby, understanding the stages of labor can help you feel more prepared and confident. This guide breaks down each stage, offering...',
    publishedDate: 'June 30, 2025',
    source: 'Mayo Clinic',
    fetchedDate: 'July 1, 2025',
  },
  {
    image: article,
    title: 'Common Discomforts During Pregnancy and How to Manage Them',
    status: 'Draft',
    description: 'Morning sickness, back pain, and fatigue are common challenges during pregnancy. Discover practical tips and remedies to alleviate these discomforts and enjoy a healthier...',
    publishedDate: 'June 12, 2025',
    source: 'WebMD',
    fetchedDate: 'June 13, 2025',
  },
  {
    image: article,
    title: 'Benefits of Exercise During Pregnancy for Mother and Baby',
    status: 'Posted',
    description: 'Staying active during pregnancy offers numerous benefits, from reducing backaches to improving your mood and stamina for labor. Learn about safe exercises and activities...',
    publishedDate: 'May 25, 2025',
    source: 'Healthline',
    fetchedDate: 'May 26, 2025',
  },
];


export default function InformativeContentPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null); // State for the selected article

  // --- Handlers ---
  const handleViewArticle = (article: Article) => {
    setSelectedArticle(article);
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
  };

  const filteredArticles = articles.filter(article => {
    if (activeFilter === 'All') return true;
    return article.status === activeFilter;
  });
  
  const counts = {
    All: articles.length,
    Posted: articles.filter(a => a.status === 'Posted').length,
    Draft: articles.filter(a => a.status === 'Draft').length,
    Archived: articles.filter(a => a.status === 'Archived').length,
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <SidebarComponents />
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="container mx-auto space-y-6">
            {selectedArticle ? (
              // If an article is selected, show the detail view
              <ArticleDetailView article={selectedArticle} onBack={handleBackToList} />
            ) : (
              // Otherwise, show the list/grid view
              <>
                <InformativeContentHeader />
                <ContentFilter activeFilter={activeFilter} setActiveFilter={setActiveFilter} counts={counts} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((article, index) => (
                    <ContentCard 
                      key={index} 
                      article={article} 
                      onView={handleViewArticle} // Pass the handler to each card
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}