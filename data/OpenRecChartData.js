/*
    Google Charts data for page /audits/recommend.html
    see: https://developers.google.com/chart/interactive/docs/datatables_dataviews

    Data updated November 2019

*/

// Colors from IG Semiannual Reports
var OIGYELLOW = "#ffcd67";
var OIGBLUE = "#415d84";  
var OIGGRAY = "#8b9cb4";

var OpenRecChartData = [
    {
        "containerId": "chart-1",
        "chartType": "BarChart",
        "options": {
            "chartArea": {
                "left": "40%",
                "height": "80%"
            },
            "height": 700,
            "title": "Open Recommendations by Responsible Office",
            "colors": [
                OIGBLUE
            ],
            "width": "100%",
            "legend": {
                "position": "none"
            },
            "animation": {
                "startup": true
            }
        },
        "dataSourceUrl": null,
        "dataTable": [
            [
                "Responsible Office",
                "No.Recs"
            ],
            [
                "Chief Financial Officer",
                41
            ],
            [
                "Chief Information Officer",
                24
            ],
            [
                "Human Exploration and Operation",
                27
            ],
            [
                "General Counsel",
                1
            ],
            [
                "Goddard Space Flight Center",
                3
            ],
            [
                "Jet Propulsion Laboratory",
                1
            ],
            [
                "Kennedy Space Center",
                1
            ],
            [
                "Marshall Space Flight Center",
                25
            ],
            [
                "Mission Support",
                5
            ],
            [
                "NASA Shared Services Center",
                1
            ],
            [
                "NASA Management Office",
                8
            ],
            [
                "Non-NASA",
                6
            ],
            [
                "Office of International and Interagency Relations",
                1
            ],
            [
                "Office of Protective Services",
                8
            ],
            [
                "Office of the Administrator",
                6
            ],
            [
                "Procurement",
                10
            ],
            [
                "Safety & Mission Assurance",
                4
            ],
            [
                "Science",
                14
            ],
            [
                "Space Technology Mission Directorate",
                2
            ],
            [
                "Strategic Infrastructure",
                8
            ]
        ]
    },
    {
        "containerId": "chart-2",
        "chartType": "ColumnChart",
        "options": {
            "title": "NASA OIG: Open Recommendations",
            "colors": [
                OIGBLUE
            ],
            "width": "100%",
            "height": "100%",
            "legend": {
                "position": "none"
            },
            "animation": {
                "startup": true
            }
        },
        "dataSourceUrl": null,
        "dataTable": [
            [
                "Months Since Issuance",
                "Number of Recommendations"
            ],
            [
                "6 or less",
                48
            ],
            [
                "6-12",
                66
            ],
            [
                "12-18",
                38
            ],
            [
                "18-24",
                10
            ],
            [
                "24-30",
                3
            ],
            [
                "30-36",
                19
            ],
            [
                "+36",
                12
            ]
        ]
    },
    {
        "containerId": "chart-3",
        "chartType": "ColumnChart",
        "options": {
            "title": "NSAS OIG: Monetary Value of Open Recommendations",
            "colors": [
                OIGBLUE
            ],
            "width": "100%",
            "height": "100%",
            "legend": {
                "position": "none"
            },
            "animation": {
                "startup": true
            }
        },
        "dataSourceUrl": null,
        "dataTable": [
            [
                "",
                "Amount"
            ],
            [
                "Questioned Costs",
                82661950
            ],
            [
                "Funds Put to Better Use",
                211742117
            ]
        ]
    },
    {
        "containerId": "chart-4",
        "chartType": "ColumnChart",
        "options": {
            "title": "NASA OIG: Potential Savings by Fiscal Year",
            "isStacked": true,
            "colors": [
                OIGYELLOW,
                OIGBLUE
            ],
            "legend": {
                "position": "in"
            },
            "width": "100%",
            "height": "100%",
            "animation": {
                "startup": true
            }
        },
        "dataSourceUrl": null,
        "dataTable": [
            [
                "FY",
                "Closed",
                "Open"
            ],
            [
                "FY19",
                0,
                275496558
            ],
            [
                "FY18",
                12516802,
                1470000
            ],
            [
                "FY17",
                80817308,
                17115009
            ],
            [
                "FY16",
                465140,
                322500
            ],
            [
                "FY15",
                98962827,
                0
            ]
        ]
    },
    {
        "containerId": "chart-5",
        "chartType": "ColumnChart",
        "options": {
            "title": "NASA OIG: Recommendations per Fiscal Year",
            "isStacked": true,
            "colors": [
                OIGYELLOW,
                OIGBLUE
            ],
            "legend": {
                "position": "in"
            },
            "width": "100%",
            "height": "100%",
            "animation": {
                "startup": true
            }
        },

        "dataSourceUrl": null,
        "dataTable": [
            [
                "FY",
                "Closed",
                "Open"
            ],
            [
                "FY20",
                7,
                27
            ],
            [
                "FY19",
                19,
                111
            ],
            [
                "FY18",
                135,
                26
            ],
            [
                "FY17",
                138,
                21
            ],
            [
                "FY16",
                135,
                6
            ],
            [
                "FY15",
                183,
                2
            ]
        ]
    }
];
