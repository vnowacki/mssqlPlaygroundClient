const token = window.sessionStorage.getItem('token') ?? ''
import { toolbarInit } from '/components/toolbar.js'
import { sidebarInit } from '/components/sidebar.js'
import { menuInit } from '/components/menu.js'
import { listInit, usersTemplate, productsTemplate } from '/components/list.js'

const layout_config = {
    width:"100%", height:"100%",
    type: "line",
    rows: [
        {
            id: "toolbar",
            html: "",
            height: "56px",
        },
        {
            cols: [
                {
                    id: "sidebar",
                    html: "",
                    width: "250px"
                },
                {
                    id: "content",
                    html: ""
                },
                {
                    id: "rightbar",
                    html: "Aside",
                    width: "300px"
                },
            ]
        },
        {
            id: "footer",
            html: "Footer",
            height: "36px"
        }
    ]
}

const sidebar_config = [
    { 
        id: "users", 
        value: "Zarządzanie użytkownikami", 
        icon: "mdi mdi-account-multiple-outline"
    },
    {
        id: "products",
        value: "Zarządzanie produktami",
        icon: "mdi mdi-gift-outline"
    },
    {
        id: "orders",
        value: "Zarządzanie zamówieniami",
        icon: "mdi mdi-cart-outline"
    }
]

const tabbar_config = {
    mode: "top",
    views: [
        {
            id: "products",
            tab: "produkty",
            html: `produkty`
        },
        {
            id: "orders",
            tab: "zamówienia",
            html: `zamówienia`
        }
    ]
}

const aside_layout_config = {
    type: "space",
    rows: [
        {
            id: "calendar",
            html: "1",
            height: "auto"
        },
        {
            id: "list",
            html: "2"
        }
    ]
}

const calendar_config = {
    width: "100%",
    mark: date => { return (date.getTime() == new Date().setHours(0, 0, 0, 0)) ? "today" : "" }
}

const menu_config = [
    {
        id: "users", 
        value: "Użytkownicy"
    },
    {
        id: "products",
        value: "Produkty"
    },
    {
        id: "orders",
        value: "Zamówienia"
    }
]
  
const layout = new dhx.Layout("layout", layout_config)
const sidebar = new dhx.Sidebar("sidebar", { width: "100%", data: sidebar_config })
const tabbar = new dhx.Tabbar("content", tabbar_config)
const asideLayout = new dhx.Layout("rightbar", aside_layout_config)
const calendar = new dhx.Calendar("calendar", calendar_config)
const menu = new dhx.Menu("footer", { data: menu_config })

layout.getCell("toolbar").attach(toolbarInit({ title: "DHTMLX Playground" }))
layout.getCell("sidebar").attach(sidebar)
layout.getCell("content").attach(tabbar)
layout.getCell("rightbar").attach(asideLayout)
layout.getCell("footer").attach(menu)
asideLayout.getCell("calendar").attach(calendar)
asideLayout.getCell("list").attach(listInit({ url: "http://localhost:4000/users", method: "GET" }, usersTemplate))
tabbar.getCell("products").attach(listInit({ url: "http://localhost:4000/products", method: "GET" }, productsTemplate))

sidebarInit(sidebar)
menuInit(menu)