function showSection(sectionId, event) {
    window.scrollTo(0, 0);
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('bg-white/20');
    });

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('bg-white/20');
    } else {
        const buttonToActivate = document.querySelector(`.desktop-sidebar .nav-btn[onclick*="showSection('${sectionId}'"]`);
        if (buttonToActivate) {
            buttonToActivate.classList.add('bg-white/20');
        }
    }
}

function showSectionAndToggle(sectionId, event) {
    showSection(sectionId, event);
    toggleSidebar();
}

function toggleSidebar() {
    const sidebar = document.getElementById('mobileSidebar');
    sidebar.classList.toggle('active');
}

function initCharts() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded.');
        return;
    }
    const servicesCtx = document.getElementById('servicesChart');
    if (!servicesCtx) return;
    new Chart(servicesCtx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['الغسالات', 'غسالات الصحون', 'المجففات', 'التكييف', 'الأفران', 'المكانس'],
            datasets: [{
                data: [25, 20, 15, 20, 12, 8],
                backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#06B6D4', '#F59E0B', '#EC4899'],
                borderWidth: 2,
                borderColor: '#1F2937'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#D1D5DB',
                        font: {
                            family: 'Cairo'
                        }
                    }
                }
            }
        }
    });

    const brandsCtx = document.getElementById('brandsChart');
    if(!brandsCtx) return;
    new Chart(brandsCtx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['سامسونج', 'إل جي', 'بوش', 'أريستون', 'دايو', 'باناسونيك'],
            datasets: [{
                label: 'عدد الخدمات',
                data: [6, 5, 4, 3, 3, 2],
                backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#06B6D4', '#EC4899'],
                borderWidth: 1,
                borderColor: '#1F2937'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#D1D5DB' },
                    grid: { color: '#374151' }
                },
                x: {
                    ticks: {
                        color: '#D1D5DB',
                        font: {
                            family: 'Cairo'
                        }
                    },
                    grid: { color: '#374151' }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#D1D5DB',
                        font: {
                            family: 'Cairo'
                        }
                    }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    showSection('overview'); 
    setTimeout(initCharts, 500);
});

document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('mobileSidebar');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    
    if (sidebar && menuBtn && !sidebar.contains(event.target) && !menuBtn.contains(event.target)) {
        sidebar.classList.remove('active');
    }
});