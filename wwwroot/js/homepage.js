// GraphQL Client for Gixat Platform
class GraphQLClient {
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    async query(query, variables = {}) {
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, variables })
        });

        if (!response.ok) {
            throw new Error(`GraphQL query failed: ${response.status}`);
        }

        const result = await response.json();
        if (result.errors) {
            throw new Error(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
        }

        return result.data;
    }
}

// Initialize GraphQL client
const client = new GraphQLClient('/graphql');

// Load live stats when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await loadLiveStats();
    await loadAboutStats();
    setupSmoothScrolling();
});

// Smooth scrolling for navigation links
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();

                const headerOffset = 80; // Account for fixed navbar
                const elementPosition = targetElement.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Load live stats for features section
async function loadLiveStats() {
    const loadingElement = document.getElementById('statsLoading');
    const statsGrid = document.getElementById('statsGrid');

    try {
        // Show loading state
        loadingElement.style.display = 'flex';

        // Fetch real platform stats from GraphQL API
        const platformStatsQuery = `
            query GetPlatformStats {
                platformStats {
                    totalClients
                    totalCompanies
                    totalRevenue
                    averageRevenuePerClient
                }
            }
        `;

        const data = await client.query(platformStatsQuery);
        const stats = data.platformStats;

        // Hide loading and show real stats
        loadingElement.style.display = 'none';

        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${stats.totalClients.toLocaleString()}</div>
                <div class="stat-label">Total Clients</div>
                <div class="stat-description">Active customers across all garages</div>
                <div class="stat-trend positive">
                    <i class="bi bi-arrow-up"></i>
                    Growing platform
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-value">${stats.totalCompanies}</div>
                <div class="stat-label">Partner Garages</div>
                <div class="stat-description">Trusted garage partners</div>
                <div class="stat-trend positive">
                    <i class="bi bi-building"></i>
                    Nationwide network
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-value">$${stats.totalRevenue.toLocaleString()}</div>
                <div class="stat-label">Platform Revenue</div>
                <div class="stat-description">Total revenue generated</div>
                <div class="stat-trend positive">
                    <i class="bi bi-graph-up"></i>
                    Strong growth
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-value">$${stats.averageRevenuePerClient.toFixed(0)}</div>
                <div class="stat-label">Avg Revenue/Client</div>
                <div class="stat-description">Average spending per customer</div>
                <div class="stat-trend neutral">
                    <i class="bi bi-cash-stack"></i>
                    Industry standard
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-value">99.9%</div>
                <div class="stat-label">Uptime</div>
                <div class="stat-description">Platform reliability</div>
                <div class="stat-trend positive">
                    <i class="bi bi-shield-check"></i>
                    Enterprise-grade
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-value">24/7</div>
                <div class="stat-label">Support</div>
                <div class="stat-description">Always available assistance</div>
                <div class="stat-trend positive">
                    <i class="bi bi-headset"></i>
                    Expert help
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Failed to load live stats:', error);
        // Fallback to demo data if GraphQL fails
        loadingElement.style.display = 'none';
        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">1,247</div>
                <div class="stat-label">Total Clients</div>
                <div class="stat-description">Active customers (demo data)</div>
                <div class="stat-trend neutral">
                    <i class="bi bi-info-circle"></i>
                    Demo mode
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-value">89</div>
                <div class="stat-label">VIP Clients</div>
                <div class="stat-description">High-value customers (demo)</div>
                <div class="stat-trend neutral">
                    <i class="bi bi-info-circle"></i>
                    Demo mode
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-value">$48,750</div>
                <div class="stat-label">Monthly Revenue</div>
                <div class="stat-description">Total earnings (demo data)</div>
                <div class="stat-trend neutral">
                    <i class="bi bi-info-circle"></i>
                    Demo mode
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-value">23</div>
                <div class="stat-label">Active Jobs</div>
                <div class="stat-description">Currently in progress (demo)</div>
                <div class="stat-trend neutral">
                    <i class="bi bi-info-circle"></i>
                    Demo mode
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-value">15</div>
                <div class="stat-label">Completed Today</div>
                <div class="stat-description">Jobs finished today (demo)</div>
                <div class="stat-trend neutral">
                    <i class="bi bi-info-circle"></i>
                    Demo mode
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-value">99.8%</div>
                <div class="stat-label">Satisfaction</div>
                <div class="stat-description">Customer satisfaction rate</div>
                <div class="stat-trend positive">
                    <i class="bi bi-star"></i>
                    Excellent
                </div>
            </div>
        `;
    }
}

// Load stats for About section
async function loadAboutStats() {
    try {
        // Fetch real platform stats from GraphQL API
        const platformStatsQuery = `
            query GetPlatformStats {
                platformStats {
                    totalClients
                    totalCompanies
                    totalRevenue
                    averageRevenuePerClient
                }
            }
        `;

        const data = await client.query(platformStatsQuery);
        const stats = data.platformStats;

        // Calculate derived stats
        const totalServices = stats.totalClients * 12; // Assuming 12 services per client on average
        const avgGrowth = 35; // This would come from business metrics
        const uptime = 99.9;
        const rating = 4.9;

        // Update Stats section with gradient background
        document.getElementById('jobs-count').textContent = totalServices.toLocaleString() + '+';
        document.getElementById('garages-count').textContent = stats.totalCompanies + '+';
        document.getElementById('uptime-stat').textContent = uptime + '%';
        document.getElementById('growth-stat').textContent = avgGrowth + '%';

        // Update About section main stats
        document.getElementById('about-workshops').textContent = stats.totalCompanies + '+';
        document.getElementById('about-services').textContent = totalServices.toLocaleString() + '+';
        document.getElementById('about-rating').textContent = rating + '/5';
        document.getElementById('about-growth').textContent = avgGrowth + '%';
        document.getElementById('about-uptime').textContent = uptime + '%';
        document.getElementById('about-support').textContent = '24/7';

    } catch (error) {
        console.error('Failed to load about stats:', error);
        // Keep zeros on error - no fallback demo data
    }
}
