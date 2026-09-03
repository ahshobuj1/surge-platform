// components/FeaturesSection.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const dummyFeatures = [
    {
        title: "Automated RSS Collection",
        description: "Connect your RSS feeds and automatically collect articles from trusted sources throughout the day.",
    },
    {
        title: "AI Editorial Clustering",
        description: "Our AI analyzes recent articles and groups them into meaningful editorial themes.",
    },
    {
        title: "Direct CMS Publishing",
        description: "Articles are published automatically to your site through CMS integration.",
    },
    {
        title: "Automation Monitoring",
        description: "Track system status, publishing activity, and failures from a simple dashboard.",
    },
];

export default function FeaturesSection() {
    return (
        <section className="py-20 md:py-24 bg-white">
            <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">

                {/* Header */}
                <h2 className="text-4xl font-semibold tracking-tight px-2 md:px-32">Powerful Automation For AI-Driven Publishing</h2>
                <p className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Automatically collect articles from RSS feeds, identify meaningful themes with AI,
                    <br className="hidden sm:inline" />
                    generate full-length content, and publish directly to your CMS.
                </p>

                {/* 2×2 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7 lg:gap-8">

                    {dummyFeatures.map((feature, idx) => (
                        <Card
                            key={idx}
                            className={`
                border border-gray-200/80 rounded-2xl overflow-hidden
                bg-white shadow-sm hover:shadow-md transition-shadow duration-300
              `}
                        >
                            {/* Placeholder image area – exactly like in the screenshot */}
                            <div className="h-56 md:h-64 bg-gradient-to-br from-gray-50 to-gray-100/70 flex items-center justify-center">
                                <div className="text-gray-300 text-sm font-medium">
                                    {/* You can later replace with: <img src={...} className="h-full w-full object-cover" /> */}
                                    Feature visual {idx + 1}
                                </div>
                            </div>

                            <CardHeader className="px-7 pt-6 pb-8">
                                <CardTitle className="text-2xl font-bold text-gray-900 mb-3">
                                    {feature.title}
                                </CardTitle>
                                <CardDescription className="text-base text-gray-600 leading-relaxed">
                                    {feature.description}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}

                </div>
            </div>
        </section>
    );
}