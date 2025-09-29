import { Link } from "react-router-dom";

const articles = [
    {
        title: "The Importance of Prenatal Care for Every Mother",
        date: "August 1, 2025",
        source: "Mayo Clinic",
        image: "/src/assets/article1.png",
        excerpt: "Regular prenatal check-ups help monitor both the mother's and baby's health, ensuring early detection of potential risks. These visits also provide..."
    },
    {
        title: "The Importance of Prenatal Care for Every Mother",
        date: "August 1, 2025",
        source: "Mayo Clinic",
        image: "/src/assets/article2.png",
        excerpt: "Regular prenatal check-ups help monitor both the mother's and baby's health, ensuring early detection of potential risks. These visits also provide..."
    }
]

export default function InformativeContent() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Informative Content</h3>
            <Link
            to="informative-content"
            className="text-sm font-medium text-red-500 hover:text-pink-600"
            >
            View All
            </Link>
            </div>
            <div className="space-y-5">
                {articles.map((article, index) => (
                    <div key={index} className="flex items-start space-x-4">
                        <img 
                            className="h-20 w-20 rounded-lg object-cover" 
                            src={article.image} 
                            alt={article.title} 
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null; 
                                target.src = `https://placehold.co/80x80/EFEFEF/333333?text=Article`;
                            }}
                        />
                        <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-sm leading-tight hover:underline cursor-pointer">{article.title}</p>
                            <div className="flex items-center text-xs text-gray-400 mt-1 space-x-2">
                                <span>{article.date}</span>
                                <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                                <span>Source: {article.source}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{article.excerpt}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
