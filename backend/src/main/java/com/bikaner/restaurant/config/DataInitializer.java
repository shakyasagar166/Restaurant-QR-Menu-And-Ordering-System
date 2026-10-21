package com.bikaner.restaurant.config;

import com.bikaner.restaurant.model.MenuItem;
import com.bikaner.restaurant.repository.MenuItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final MenuItemRepository menuItemRepository;
    private final com.bikaner.restaurant.repository.OrderRepository orderRepository;

    public DataInitializer(MenuItemRepository menuItemRepository, com.bikaner.restaurant.repository.OrderRepository orderRepository) {
        this.menuItemRepository = menuItemRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    public void run(String... args) {
        if (menuItemRepository.count() > 0) {
            System.out.println("Menu already seeded (" + menuItemRepository.count() + " items).");
            return;
        }

        List<MenuItem> items = Arrays.asList(
            // ================= Indian Breads =================
            new MenuItem("Tandoori Roti", "Indian Breads", 35.0, "Crispy whole wheat bread baked to perfection in traditional clay oven", "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80", "Staple"),
            new MenuItem("Tandoori Butter Roti", "Indian Breads", 40.0, "Crispy tandoori roti layered with rich melted desi butter", "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80", "Popular"),
            new MenuItem("Plain Naan", "Indian Breads", 75.0, "Soft and fluffy refined flour bread baked fresh in tandoor", "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80", "Classic"),
            new MenuItem("Butter Naan", "Indian Breads", 95.0, "Layered tender naan generously brushed with creamy butter", "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80", "Bestseller"),
            new MenuItem("Garlic Naan", "Indian Breads", 105.0, "Fresh naan infused with roasted garlic chunks and fresh coriander", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80", "Chef Special"),
            new MenuItem("Chilli Garlic Naan", "Indian Breads", 100.0, "Spicy twist of green chillies and fragrant roasted garlic", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80", "Spicy"),
            new MenuItem("Cheese Naan", "Indian Breads", 100.0, "Fresh baked naan stuffed with gooey molten cheese", "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80", "Must Try"),
            new MenuItem("Lachha Parantha", "Indian Breads", 90.0, "Multi-layered crispy wheat bread with aromatic ghee flavor", "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80", "Popular"),
            new MenuItem("Pudina Parantha", "Indian Breads", 90.0, "Layered flaky parantha seasoned with dry mint herbs", "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80", "Aromatic"),
            new MenuItem("Kulcha (Onion/Aloo)", "Indian Breads", 135.0, "Served with curd and fresh mint chutney", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80", "Special"),
            new MenuItem("Kulcha (Paneer)", "Indian Breads", 150.0, "Stuffed with seasoned paneer crumble, served with curd & chutney", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80", "Rich"),
            new MenuItem("Missi Roti", "Indian Breads", 70.0, "Gram flour and spices roasted bread with fenugreek leaves", "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80", "Traditional"),

            // ================= Beverages =================
            new MenuItem("Hot Coffee", "Beverages", 90.0, "Rich, aromatic and frothy hot espresso brew", "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80", "Hot"),
            new MenuItem("Cold Coffee", "Beverages", 145.0, "Chilled thick blended coffee with creamy milk froth", "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80", "Popular"),
            new MenuItem("Cold Coffee with Ice Cream", "Beverages", 185.0, "Signature cold coffee topped with a creamy scoop of vanilla ice cream", "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80", "Bestseller"),
            new MenuItem("Kesar Pista Badam Milk", "Beverages", 105.0, "Saffron and almond infused royal warm/chilled milk", "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80", "Royal"),
            new MenuItem("Fresh Lime Soda (Sweet/Salted)", "Beverages", 105.0, "Zesty freshly squeezed lime with chilled sparkling soda", "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80", "Refreshing"),
            new MenuItem("Special Masala Tea", "Beverages", 50.0, "Authentic Indian milk tea brewed with cardamom and ginger", "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80", "Classic"),
            new MenuItem("Green Tea", "Beverages", 60.0, "Light and soothing antioxidant rich pure green tea", "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=600&auto=format&fit=crop&q=80", "Healthy"),
            new MenuItem("Lemon Ice Tea", "Beverages", 125.0, "Iced brewed black tea with lemon zest and mint sprigs", "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80", "Chilled"),

            // ================= Mocktails =================
            new MenuItem("Virgin Mojito", "Mocktails", 160.0, "Muddled fresh mint leaves, lime wedges, simple syrup and soda", "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80", "Bestseller"),
            new MenuItem("Watermelon Mojito", "Mocktails", 160.0, "Sweet watermelon juice infused with fresh mint and fizz", "https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&auto=format&fit=crop&q=80", "Summer Special"),
            new MenuItem("Green Apple Mojito", "Mocktails", 160.0, "Crisp tangy green apple blend with lime and bubbly soda", "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80", "Popular"),
            new MenuItem("Cucumber Mojito", "Mocktails", 160.0, "Ultra cooling fresh cucumber slices muddled with mint", "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=600&auto=format&fit=crop&q=80", "Detox"),
            new MenuItem("Spl Kala Khatta", "Mocktails", 160.0, "Desi tangy jamun & spice mocktail, nostalgia in every sip", "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=600&auto=format&fit=crop&q=80", "Signature"),
            new MenuItem("Masala Lemonade", "Mocktails", 160.0, "Spiced Indian lemonade with roasted cumin and rock salt", "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80", "Desi Twist"),

            // ================= A' La Carte (Curries & Dal) =================
            new MenuItem("Paneer Butter Masala", "Curries & Dal", 385.0, "Tender paneer cubes simmered in rich creamy tomato cashew gravy", "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80", "Bestseller"),
            new MenuItem("Kadai Paneer", "Curries & Dal", 385.0, "Cottage cheese with capsicum, onion and freshly pounded spices", "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80", "Chef Special"),
            new MenuItem("Shahi Paneer", "Curries & Dal", 385.0, "Royal cottage cheese in aromatic white and yellow velvet gravy", "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80", "Rich"),
            new MenuItem("Paneer Lababdar", "Curries & Dal", 385.0, "Lush gravy made with grated paneer, tomatoes and aromatic herbs", "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80", "Popular"),
            new MenuItem("Paneer Bhurjee", "Curries & Dal", 385.0, "Scrambled fresh paneer cooked with onions, tomatoes and green chillies", "https://images.unsplash.com/photo-1567337710282-00832b415979?w=600&auto=format&fit=crop&q=80", "Delight"),
            new MenuItem("Spl. Cheese Butter Masala", "Curries & Dal", 385.0, "Chef special recipe with abundant molten cheese in rich butter gravy", "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80", "Special"),
            new MenuItem("Bikaner Express Spl. Makkhan Wali Daal", "Curries & Dal", 335.0, "Slow-cooked black lentils overnight with white butter and cream", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80", "Signature"),
            new MenuItem("Dal Makhani", "Curries & Dal", 325.0, "Classic creamy black lentils infused with garlic, tomato and butter", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80", "Bestseller"),
            new MenuItem("Yellow Dal Tadka", "Curries & Dal", 265.0, "Yellow lentils tempered with ghee, cumin, garlic and dry red chillies", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80", "Comfort"),
            new MenuItem("Dhabey Ki Daal", "Curries & Dal", 275.0, "Authentic highway dhaba style rustic spiced mixed lentils", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80", "Homestyle"),
            new MenuItem("Matar Mushroom", "Curries & Dal", 320.0, "Fresh button mushrooms and green peas in spiced onion tomato masala", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80", "Popular"),
            new MenuItem("Chana Masala Pindi Style", "Curries & Dal", 300.0, "Dark roasted spiced chickpeas bursting with traditional Amritsari flavor", "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80", "North Indian"),
            new MenuItem("Dum Aloo Masala", "Curries & Dal", 290.0, "Baby potatoes slow cooked in rich spiced Kashmiri style gravy", "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80", "Delicious"),

            // ================= Tandoori Factory =================
            new MenuItem("Tandoori Paneer Tikka", "Tandoori Factory", 370.0, "Succulent cottage cheese cubes marinated in spiced hung curd & grilled", "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80", "Bestseller"),
            new MenuItem("Tandoori Achari Chaap", "Tandoori Factory", 290.0, "Juicy soya chaap infused with pickle spices and charred in clay oven", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80", "Tangy & Spicy"),
            new MenuItem("Tandoori Malai Chaap", "Tandoori Factory", 290.0, "Creamy mild soya chaap marinated in fresh cream, cashew paste and cheese", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80", "Chef Special"),
            new MenuItem("Tandoori Pudina Chaap", "Tandoori Factory", 290.0, "Fresh mint and coriander glazed tender soya chaap roasted in tandoor", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80", "Aromatic"),
            new MenuItem("Tandoori Vegetable Seekh Kebab", "Tandoori Factory", 290.0, "Minced mixed vegetables & spices skewered and charred to perfection", "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80", "Popular"),
            new MenuItem("Tandoori Kumbh", "Tandoori Factory", 275.0, "Whole button mushrooms stuffed with spiced cheese and tandoor grilled", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80", "Must Try"),

            // ================= Chandni Chowk To China =================
            new MenuItem("Hakka Noodles", "Chinese & Noodles", 230.0, "Wok tossed noodles with crunchy julienne veggies and oriental sauces", "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80", "Bestseller"),
            new MenuItem("Paneer Noodles", "Chinese & Noodles", 230.0, "Noodles tossed with roasted paneer bits and crunchy spring onions", "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80", "Popular"),
            new MenuItem("Veg Fried Rice", "Chinese & Noodles", 230.0, "Fragrant long grain rice wok fried with diced farm fresh vegetables", "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80", "Classic"),
            new MenuItem("Paneer Fried Rice", "Chinese & Noodles", 250.0, "Flavorful fried rice loaded with tender paneer cubes and herbs", "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80", "Delight"),
            new MenuItem("Veg Manchurian (Dry/Gravy)", "Chinese & Noodles", 270.0, "Crispy veggie dumplings tossed in ginger garlic soya sauce", "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=80", "Favorite"),
            new MenuItem("Chilli Paneer (Dry/Gravy)", "Chinese & Noodles", 330.0, "Crispy coated cottage cheese cubes tossed with bell peppers and chillies", "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80", "Bestseller"),
            new MenuItem("Honey Chilli Potato", "Chinese & Noodles", 220.0, "Crispy fried potato fingers glazed with honey sesame chilli sauce", "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&auto=format&fit=crop&q=80", "Sweet & Spicy"),
            new MenuItem("Crispy Chilli Potato", "Chinese & Noodles", 220.0, "Fiery spicy crisp potato sticks tossed with onions and schezwan dip", "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&auto=format&fit=crop&q=80", "Crispy"),
            new MenuItem("Chinese Platter", "Chinese & Noodles", 350.0, "Chowmein, Fried Rice, Veg Manchurian & Chilli Paneer combo", "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80", "Chef Special"),

            // ================= Dakshin Bhavan (South Indian) =================
            new MenuItem("Plain Dosa", "South Indian", 220.0, "Crispy golden fermented rice and lentil crepe served with sambar & chutney", "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80", "Classic"),
            new MenuItem("Masala Dosa", "South Indian", 240.0, "Crispy golden dosa stuffed with aromatic spiced potato mash", "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80", "Bestseller"),
            new MenuItem("Cheese Masala Dosa", "South Indian", 250.0, "Hot crispy masala dosa loaded with generous melted cheese", "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80", "Cheesy"),
            new MenuItem("Paneer Masala Dosa", "South Indian", 275.0, "Dosa stuffed with seasoned paneer filling and potato spices", "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80", "Rich"),
            new MenuItem("Mysore Masala Dosa", "South Indian", 280.0, "Spicy red garlic chutney lined crispy dosa with aloo bhaji", "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80", "Spicy Special"),
            new MenuItem("Schezwan Chilli Cheese Dosa", "South Indian", 250.0, "Fusion delight with spicy schezwan sauce and gooey cheese", "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80", "Fusion"),
            new MenuItem("Idli Sambar (2 Pcs)", "South Indian", 175.0, "Steamed soft fluffy rice cakes served with steaming hot sambar and chutneys", "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80", "Healthy"),
            new MenuItem("Bikaner Express Family Dosa", "South Indian", 385.0, "Gigantic 4-foot grand crispy dosa for the whole family", "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80", "Grand Special"),

            // ================= Delhi-6 Ka Chatka & Morning Spl =================
            new MenuItem("Gol Gappa (6 Pcs)", "Chaat & Snacks", 70.0, "Crisp semolina puries filled with spiced potatoes, tangy mint and sweet tamarind water", "https://images.unsplash.com/photo-1649140041688-0f75446e707e?w=600&auto=format&fit=crop&q=80", "Bestseller"),
            new MenuItem("Dahi Bhalla Papdi Chaat", "Chaat & Snacks", 175.0, "Soft lentil dumplings and crisp papdis bathed in sweetened curd, chutneys and roasted jeera", "https://images.unsplash.com/photo-1777732785406-f18022cbac1d?w=600&auto=format&fit=crop&q=80", "Popular"),
            new MenuItem("Raj Kachori", "Chaat & Snacks", 175.0, "The king of chaats! Huge crisp kachori overflowing with sprouts, curd, pomegranate & sev", "https://images.unsplash.com/photo-1777732785406-f18022cbac1d?w=600&auto=format&fit=crop&q=80", "Royal Favorite"),
            new MenuItem("Aloo Tikki with Choley", "Chaat & Snacks", 155.0, "Hot crisp potato patty served with spicy Amritsari choley, curd and sonth", "https://images.unsplash.com/photo-1777732785406-f18022cbac1d?w=600&auto=format&fit=crop&q=80", "Crispy Delight"),
            new MenuItem("Samosa (2 Pcs)", "Chaat & Snacks", 30.0, "Crispy golden pastry stuffed with spiced potatoes and green peas", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80", "Hot & Fresh"),
            new MenuItem("Chole Bhature", "Chaat & Snacks", 210.0, "Two fluffy puffy bhatures served with rich spicy pindi chole, pickle and onion salad", "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80", "Bestseller"),
            new MenuItem("Pav Bhaji", "Chaat & Snacks", 210.0, "Mashed spiced mixed vegetables cooked in abundance of butter, with toasted pavs", "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80", "Mumbai Famous"),
            new MenuItem("Puri Thali", "Chaat & Snacks", 130.0, "2 big size puries served with aloo sabzi, raita, fresh salad & sweet", "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80", "Wholesome"),

            // ================= Thali & Platters =================
            new MenuItem("Executive Thali", "Thali & Platters", 320.0, "2 Tandoori Roti, Dal Makhani, Paneer Sabji, Pulao, Raita, Papad, Pickle & Fresh Salad", "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80", "Best Value"),
            new MenuItem("Bikaner Deluxe Thali", "Thali & Platters", 425.0, "1 Lachha Paratha, 1 Naan, Dal Makhani, Paneer Sabji, Rice, Raita, Mix Veg, Papad, Sweet Dish & Salad", "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80", "Chef Recommended"),
            new MenuItem("S.P.L. Thali", "Thali & Platters", 370.0, "2 Lachha Paratha, Dal Makhani, Paneer Sabji, Rice, Pickle, Papad, Salad & 4 Pcs Mini Rasgulla", "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80", "Special"),
            new MenuItem("Tandoori Platter", "Thali & Platters", 440.0, "Paneer Tikka, Veg Seekh Kebab, Tandoori Aloo, Tandoori Mushroom served with Dal Makhani, Naan & Aerated Drink", "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80", "Grand Platter"),

            // ================= Pizza, Burger & Continental =================
            new MenuItem("Margherita Pizza (8-inch)", "Pizza & Burger", 285.0, "Gourmet crust, rich Italian marinara sauce and 100% mozzarella cheese", "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80", "Classic"),
            new MenuItem("Paneer Tikka Pizza (8-inch)", "Pizza & Burger", 340.0, "Topped with charred tandoori paneer cubes, capsicum, onion and mozzarella", "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80", "Bestseller"),
            new MenuItem("Veggie Supreme Pizza (8-inch)", "Pizza & Burger", 340.0, "Loaded with black olives, sweet corn, mushrooms, bell peppers and cheese", "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=600&auto=format&fit=crop&q=80", "Supreme"),
            new MenuItem("Veg. Cheese Grilled Sandwich", "Pizza & Burger", 210.0, "Triple layered jumbo sandwich filled with veggies and gooey melted cheese", "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80", "Crispy Grilled"),
            new MenuItem("Vegetable Cheese Burger", "Pizza & Burger", 150.0, "Crispy herb potato patty, cheddar slice, fresh lettuce, tomato & mayo", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80", "Juicy"),

            // ================= Meetha - Maza & Desserts =================
            new MenuItem("Gulab Jamun with Ice Cream", "Desserts & Sweets", 120.0, "Warm soft mawa gulab jamun served with creamy vanilla scoop", "https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?w=600&auto=format&fit=crop&q=80", "Bestseller"),
            new MenuItem("Rasmalai (2 Pcs)", "Desserts & Sweets", 110.0, "Delicate cottage cheese patties soaked in saffron cardamom thickened milk", "https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=600&auto=format&fit=crop&q=80", "Royal"),
            new MenuItem("Rabdi Rasmalai", "Desserts & Sweets", 75.0, "Rasmalai coated in thick traditional slow-cooked malai rabdi", "https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=600&auto=format&fit=crop&q=80", "Special"),
            new MenuItem("Stick Kulfi", "Desserts & Sweets", 80.0, "Authentic traditional Malai Kesar Pista kulfi on a stick", "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80", "Desi Treat"),
            new MenuItem("Kulfi with Faluda", "Desserts & Sweets", 140.0, "Rich kulfi slices topped with chilled rose faluda noodles and sabja", "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80", "Signature"),
            new MenuItem("Choco Truffle Pastry", "Desserts & Sweets", 120.0, "Decadent Dutch chocolate sponge layered with silky chocolate ganache", "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80", "Sinful"),
            new MenuItem("Dark Chocolate Pastry", "Desserts & Sweets", 110.0, "Rich and moist dark chocolate slice for real chocolate connoisseurs", "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80", "Eggless")
        );

        menuItemRepository.saveAll(items);
        System.out.println("✅ Successfully seeded " + items.size() + " authentic Bikaner Express menu items!");

        // Seed realistic initial orders for Admin Sales Dashboard
        if (orderRepository.count() == 0) {
            com.bikaner.restaurant.model.Order o1 = new com.bikaner.restaurant.model.Order();
            o1.setTableNumber("T-2");
            o1.setCustomerName("Vikram Singh");
            o1.setCustomerPhone("9897123456");
            o1.setStatus(com.bikaner.restaurant.model.OrderStatus.SERVED);
            o1.setTotalAmount(1280.0);
            o1.setNotes("Served fresh with pickled onions");
            o1.addItem(new com.bikaner.restaurant.model.OrderItem(1L, "Tandoori Butter Roti", 40.0, 4, ""));
            o1.addItem(new com.bikaner.restaurant.model.OrderItem(12L, "Paneer Butter Masala", 385.0, 2, ""));
            o1.addItem(new com.bikaner.restaurant.model.OrderItem(3L, "Cold Coffee with Ice Cream", 185.0, 2, ""));
            orderRepository.save(o1);

            com.bikaner.restaurant.model.Order o2 = new com.bikaner.restaurant.model.Order();
            o2.setTableNumber("T-5");
            o2.setCustomerName("Anjali Gupta");
            o2.setCustomerPhone("9811223344");
            o2.setStatus(com.bikaner.restaurant.model.OrderStatus.ACCEPTED);
            o2.setTotalAmount(1840.0);
            o2.setNotes("Medium spicy, extra green chutney");
            o2.addItem(new com.bikaner.restaurant.model.OrderItem(5L, "Garlic Naan", 105.0, 4, ""));
            o2.addItem(new com.bikaner.restaurant.model.OrderItem(13L, "Dal Makhani", 325.0, 2, ""));
            o2.addItem(new com.bikaner.restaurant.model.OrderItem(20L, "Tandoori Paneer Tikka", 370.0, 2, ""));
            orderRepository.save(o2);

            com.bikaner.restaurant.model.Order o3 = new com.bikaner.restaurant.model.Order();
            o3.setTableNumber("T-8");
            o3.setCustomerName("Rajesh Verma");
            o3.setCustomerPhone("9927889900");
            o3.setStatus(com.bikaner.restaurant.model.OrderStatus.SERVED);
            o3.setTotalAmount(850.0);
            o3.setNotes("Family dinner");
            o3.addItem(new com.bikaner.restaurant.model.OrderItem(40L, "Bikaner Deluxe Thali", 425.0, 2, ""));
            orderRepository.save(o3);

            System.out.println("✅ Successfully seeded initial sample orders with total sales for admin dashboard!");
        }
    }
}
