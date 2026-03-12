import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MOCK_BLOGS = [
    {
        id: 'b1',
        title: 'The Future of Urban Development in Kathmandu',
        author: 'Balendra Shah',
        date: '2026-03-01',
        excerpt: 'Exploring sustainable infrastructure and smart city initiatives to transform our beloved capital into a resilient, modern metropolis.',
        content: `As we look towards the next decade, the modernization of Kathmandu is not just a dream but a necessity. The rapid urbanization we've experienced demands a structured, sustainable approach.

First, we must prioritize green infrastructure. Integrating parks, green roofs, and sustainable drainage systems will not only beautify the city but also combat urban heat and manage monsoon runoffs effectively.

Second, smart transportation is critical. A reliable, eco-friendly public transit network will reduce congestion and air pollution. We are exploring electric buses and better pedestrian pathways to make our streets safer and more accessible.

Finally, digital governance will bridge the gap between citizens and the administration. The JanAawaz platform is just the beginning. We envision a city where every citizen can cleanly and transparently interact with municipal services.

Together, we can build a Kathmandu that honors its rich heritage while embracing the future.`,
        tags: ['Urban Planning', 'Sustainability', 'Smart City']
    },
    {
        id: 'b2',
        title: 'Revitalizing Nepal\'s Economy Through Technology',
        author: 'Dr. Swarnim Wagle',
        date: '2026-02-15',
        excerpt: 'A deep dive into how digitalization and technological innovation can propel Nepal into an era of unprecedented economic growth.',
        content: `Economic growth in the 21st century is intricately tied to technological advancement. For Nepal, embracing the digital economy is not merely an option; it is an imperative.

Our youth are our greatest asset. By investing in digital literacy and creating hubs for innovation, we can transform Nepal into a regional tech powerhouse. The gig economy and remote work have already shown that geographical boundaries no longer limit earning potential.

Furthermore, digitalizing government services reduces bureaucratic friction and creates a more conducive environment for businesses to thrive. We need policies that encourage startups, protect intellectual property, and attract foreign direct investment in the tech sector.

Let's build an ecosystem where innovation is rewarded, and technology serves as the great equalizer, providing robust opportunities for all Nepalis, regardless of where they live.`,
        tags: ['Economy', 'Technology', 'Innovation']
    },
    {
        id: 'b3',
        title: 'Preserving Heritage in a Modernizing World',
        author: 'Sunil Babu Pant',
        date: '2026-01-10',
        excerpt: 'Strategies for maintaining our cultural identity and historical sites while adapting to the rapid pace of global modernization.',
        content: `Nepal's soul lies in its rich tapestry of culture, art, and history. As we pave the way for modern infrastructure, we face the delicate task of ensuring our heritage is not paved over.

Conservation is not about halting progress; it's about integrating our history into our future. Restoring ancient temples and preserving traditional architecture can coexist with modern amenities. In fact, sustainable tourism heavily relies on the authentic preservation of these sites.

We must implement strict zoning laws around heritage sites, ensuring new constructions harmonize with historical aesthetics. Moreover, incorporating traditional building techniques and materials into modern architecture can provide a unique identity to our urban landscapes.

Our heritage is a bridge to our past and a beacon for our future. Let us modernize with mindfulness, ensuring the legacy of our ancestors remains vibrant for generations to come.`,
        tags: ['Culture', 'Heritage', 'Conservation']
    }
];

const Blogs = () => {
    const [expandedBlog, setExpandedBlog] = useState(null);

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '100px' }}>
            <header style={{ marginBottom: '60px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-2px', marginBottom: '16px', color: 'var(--primary)' }}>
                    Curated <span style={{ color: 'var(--secondary)' }}>Insights</span>
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    Perspectives on policy, development, and the future from notable thought leaders.
                </p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                {MOCK_BLOGS.map(blog => (
                    <div key={blog.id} className="glass-effect hover-glow animate-fade-in" style={{ padding: '32px', background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', transition: 'all 0.3s ease' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            {blog.tags.map(tag => (
                                <span key={tag} style={{ fontSize: '0.7rem', color: 'var(--secondary)', background: 'rgba(220, 38, 38, 0.05)', padding: '6px 14px', borderRadius: '100px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', border: '1px solid rgba(220, 38, 38, 0.1)' }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                        
                        <h2 style={{ fontSize: '2rem', marginBottom: '16px', lineHeight: 1.3, color: 'var(--primary)', fontWeight: 800 }}>
                            {blog.title}
                        </h2>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{blog.author}</span>
                            <span>•</span>
                            <span>{new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        
                        {!expandedBlog || expandedBlog !== blog.id ? (
                            <>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '24px', lineHeight: 1.6 }}>
                                    {blog.excerpt}
                                </p>
                                <button 
                                    onClick={() => setExpandedBlog(blog.id)}
                                    style={{ background: 'transparent', border: '1px solid var(--secondary)', color: 'var(--secondary)', padding: '10px 24px', borderRadius: '100px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s ease' }}
                                    onMouseOver={(e) => { e.target.style.background = 'var(--secondary)'; e.target.style.color = 'white'; }}
                                    onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--secondary)'; }}
                                >
                                    Read Full Article
                                </button>
                            </>
                        ) : (
                            <div className="animate-fade-in" style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--glass-border)' }}>
                                <div style={{ color: 'var(--text-primary)', fontSize: '1.1rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                                    {blog.content}
                                </div>
                                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
                                    <button 
                                        onClick={() => setExpandedBlog(null)}
                                        style={{ background: 'var(--surface-2)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', padding: '10px 32px', borderRadius: '100px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s ease' }}
                                        onMouseOver={(e) => { e.target.style.color = 'var(--primary)'; e.target.style.borderColor = 'var(--primary)'; }}
                                        onMouseOut={(e) => { e.target.style.color = 'var(--text-secondary)'; e.target.style.borderColor = 'var(--glass-border)'; }}
                                    >
                                        Close Article
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Blogs;
