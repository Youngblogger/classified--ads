<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Ad;

$ctaOptions = [
    "Chat me for more details",
    "Call for inspection and quick deal",
    "Serious buyer only please",
    "Send a message for fast response",
    "Interested buyer should chat me",
    "Call or WhatsApp me for details",
    "Message me if you are serious",
    "Call my number for quick response",
    "Chat me to inspect the item",
    "Available for immediate inspection",
    "Contact me for more information",
    "Only serious buyers should reach out",
    "Send WhatsApp message for details",
    "Call me for negotiation and deal",
    "Chat me if you are ready to buy",
    "Reach me for quick purchase",
    "Call or message for inspection",
    "Serious buyers should not waste time",
    "Chat me for fast response",
    "WhatsApp me for quick reply",
    "Call me for immediate inspection",
    "Send message for price and details",
    "Chat me if interested in buying",
    "Call or chat for best deal",
    "Serious inquiries only please",
    "Contact me for quick transaction",
    "Message me to arrange viewing",
    "Call for more clarification",
    "Chat me for negotiation",
    "WhatsApp or call for details",
    "Available for viewing anytime",
    "Contact me if you are ready",
    "Chat me for pickup arrangement",
    "Call me for urgent deal",
    "Message me for fast purchase",
    "Serious buyer should contact me ASAP",
];

function getDescription($title, $ctaOptions) {
    $cta = $ctaOptions[array_rand($ctaOptions)];
    
    $descriptions = [
        'Toyota Camry' => "Very clean Toyota Camry in good condition, engine and gear are working perfectly.\nNothing to fix at all, body is straight and clean with no accidents.\nAll papers are complete and available, buy and drive no stress. {$cta}",
        'Honda Accord' => "Neatly used Honda Accord, engine is very sound with no knock at all.\nBody is straight and clean, AC is chilling perfectly and all parts working well.\nNo mechanical issues, just buy and drive go straight to anywhere. {$cta}",
        'Lexus RX' => "Very clean Lexus RX in like new condition, full option everything works perfectly.\nSunroof, navigation, heated seats, and all other features are working well.\nNo faults at all, engine is smooth and fuel consumption is good. {$cta}",
        'iPhone 13 Pro Max' => "Neatly used iPhone 13 Pro Max in very good condition, screen is clean with no cracks.\nEverything is working perfectly, battery health is at 89% and no issues at all.\nAll accessories included in the box. {$cta}",
        'Samsung Galaxy S22 Ultra' => "Very clean Samsung S22 Ultra in good condition, S Pen is working perfectly.\n256GB storage, battery is strong and all functions are working well.\nNigerian used but well maintained, no scratches on screen. {$cta}",
        'iPhone 14 Pro' => "Neatly used iPhone 14 Pro, very clean with no scratches.\nBattery health is at 95%, everything is working perfectly with no issues.\nOriginal box and charger are included. {$cta}",
        'MacBook Pro' => "Very clean MacBook Pro with M2 chip, 512GB storage and very fast performance.\nBattery cycle is at 45, still very strong and no scratches on body.\nEverything is working perfectly, great for developers and designers. {$cta}",
        'Dell XPS' => "Neatly used Dell XPS 13 in good condition, 512GB SSD and very fast laptop.\nGood for office work and everyday use, everything is working perfectly.\nBattery is strong and no issues. {$cta}",
        'Samsung 55 inch Smart TV' => "Clean Samsung 55 inch Smart TV with 4K resolution, picture is very clear and sharp.\nAll apps are working well, Netflix, YouTube and other streaming apps load fast.\nRemote control is working fine, great for living room or bedroom. {$cta}",
        '2 Bedroom Flat' => "Very clean and well painted 2 bedroom flat, tiles and ceiling are neat.\nWell secured area with 24 hours security, available for immediate occupation.\nAll rooms are spacious with good ventilation. {$cta}",
        '3 Bedroom' => "Very nice 3 bedroom flat with beautiful finishing, all rooms are en-suite.\nSpacious living room and kitchen with modern fittings throughout.\nWell secured estate with constant security, parking space available. {$cta}",
        'Toyota Hilux' => "Very clean Toyota Hilux in good condition, engine is strong and 4WD is working perfectly.\nGood for rough road and village trips, no mechanical issues at all.\nBody is clean with no accidents, all papers are complete. {$cta}",
        'Mercedes' => "German used Mercedes in very good condition, all functions are working perfectly.\nEngine is smooth, AC is chilling and no mechanical issues.\nJust maintain well as you drive, all papers are complete and available. {$cta}",
        'Apple Watch' => "Very clean Apple Watch in like new condition, all health features are working perfectly.\nBattery lasts well, screen is scratch-free and strap is clean.\nOriginal box and charger included. {$cta}",
        'Infinix Note' => "Neatly used Infinix Note in good condition, 128GB storage and all working.\nCamera is clear, battery is strong and screen is clean with no cracks.\nSelling cheaper than market price. {$cta}",
        'Tecno Camon' => "Clean Tecno Camon in good condition, 128GB storage and good camera.\nEverything is working perfectly, battery is strong and no issues.\nVery affordable price. {$cta}",
        'OPPO Reno' => "Very clean OPPO Reno in like new condition, 256GB storage and great camera quality.\nScreen is scratch-free, battery is strong and all features working perfectly.\nOriginal box is complete, no issues at all. {$cta}",
        'JBL Xtreme' => "Very loud JBL Xtreme 3 speaker in like new condition, bass is deep and clear.\nBattery lasts long, fully waterproof and all functions working perfectly.\nGreat for outdoor parties and events. {$cta}",
        'Toyota Corolla' => "Clean Toyota Corolla in good condition, engine is very sound and no noise.\nBody is clean with no accidents, buy and drive straight to anywhere.\nNothing big to fix, AC is working and all papers are complete. {$cta}",
        'Hyundai Sonata' => "Very clean Hyundai Sonata, engine is perfect with no noise at all.\nAC is chilling very well, all papers are complete and available.\nNo mechanical issues, just buy and drive. {$cta}",
        '3-Seater Sofa' => "Good quality 3-seater sofa in clean condition, fabric is neat with no tear or stains.\nStrong and sturdy, great for living room use.\nComfortable seating. {$cta}",
        'Dining Table' => "Nice dining table with 6 chairs in good condition, wood is solid and strong.\nGood for family meals, no scratches on the surface.\nAll chairs are complete and sturdy. {$cta}",
        'LG Refrigerator' => "Clean LG double door fridge in good working condition, freezer is very cold.\nInside is clean and no bad smell, energy saving and working perfectly.\nGreat for home or shop use. {$cta}",
        'Samsung Washing Machine' => "Clean Samsung front loader washing machine in good working condition.\nSpins and washes well, good for home use and all clothes.\nNo issues at all. {$cta}",
        'Generator' => "Strong generator in good condition, good for big houses.\nDiesel powered and starts very easy, no issues.\nPerfect for areas with unstable electricity supply. {$cta}",
        'Inverter' => "Brand new inverter, good for lights, fans and some appliances.\nSilent operation with no fuel worry, great alternative to generator.\nBattery and all components are included. {$cta}",
        'Sales Executive' => "We need a sales executive with experience in marketing and good communication skills.\nMust be able to meet sales targets and work well with customers.\nCommission based with good earning potential. {$cta}",
        'Graphics Designer' => "Remote graphics designer needed with good portfolio showing creative designs.\nMust know Adobe Photoshop, Illustrator and other design tools.\nCan work from home. {$cta}",
        'AC Repair' => "Expert AC repair and maintenance service for all brands and types.\nFast and reliable service, all parts are genuine.\nAvailable 24/7 for emergency repairs. {$cta}",
        'House Cleaning' => "Professional house cleaning service with trained and trustworthy staff.\nDeep cleaning available for homes and offices.\nWeekly and monthly packages available. {$cta}",
        'German Shepherd' => "German Shepherd puppy available, 3 months old and very active and playful.\nVaccinated and dewormed with good pedigree papers.\nGreat for security and companionship. {$cta}",
        'Bull Mastiff' => "Big and strong Bull Mastiff puppy, good guard dog for security.\nVaccinated and healthy, 4 months old.\nLoyal and protective. {$cta}",
        'Persian Cat' => "Fluffy and cute Persian cat, 2 months old and very adorable.\nVaccinated and litter trained, good for home companionship. {$cta}",
        'Skincare' => "Complete organic skincare set for healthy and glowing face, natural products.\nGood for all skin types, no harmful chemicals.\nComplete package with cleanser, toner and moisturizer. {$cta}",
        'Hair Extension' => "Good quality Brazilian hair extension, 20 inches long and soft.\nCan be reused many times with proper care, no shedding.\nGreat for weaving and styling. {$cta}",
        'Stroller' => "Clean Graco stroller in good condition, convertible and can lay flat.\nSafe and sturdy for babies, wheels are moving well.\nGreat for parents on the go. {$cta}",
        'Treadmill' => "Manual treadmill in good condition, good for home gym use.\nFolds easily for storage, running belt is still good.\nNo electricity needed. {$cta}",
        'Dumbbells' => "Brand new adjustable dumbbells set, weight range from 5kg to 25kg.\nGood for home gym, saves space compared to individual weights.\nEasy to adjust and use. {$cta}",
        'PlayStation 5' => "Brand new PlayStation 5 Disc Edition with 2 controllers included.\n2 popular games included, box is complete and sealed.\nGreat for gaming and entertainment. {$cta}",
        'Xbox' => "Brand new Xbox Series X with 1TB storage and 2 controllers.\n3 games included, great for family gaming and entertainment.\nBox complete. {$cta}",
        'Canon' => "Good Canon camera for photography, 2 lenses included.\nTakes clear and professional photos, great for events and portraits.\nAll functions are working perfectly. {$cta}",
        '4 Bedroom House' => "Complete 4 bedroom house with all rooms en-suite, BQ also included.\nSitting on 600sqm land with good foundation, well built and finished.\nC of O and all documents are available. {$cta}",
        'Land' => "600sqm land in Epe, dry land good for building house or commercial property.\nC of O is ready and all documents are complete.\nGood investment opportunity. {$cta}",
        'Honda CG' => "Strong Honda CG125 in good condition, engine is very powerful with no noise.\nNo issues at all, good for commercial use like dispatch or messenger work.\nAll papers complete. {$cta}",
        'Yamaha DT' => "Fast and reliable Yamaha DT, very clean and good for messenger work.\nEngine is strong, no issues and all parts working perfectly.\nGood for quick delivery and logistics business. {$cta}",
        'Bajaj Boxer' => "Very strong Bajaj Boxer 150, can carry heavy weight for commercial use.\nEngine is powerful and reliable, good for transporting goods.\nAll working perfectly. {$cta}",
        'iPad Pro' => "Very clean iPad Pro with 256GB storage in like new condition.\nKeyboard and pencil are included, great for work and creative use.\nAll functions working perfectly. {$cta}",
        'Samsung Tab' => "Clean Samsung Tab in good condition, good for reading and browsing.\nS Pen is included and working well, battery is strong.\nAll apps working. {$cta}",
        'AirPods Pro' => "Very clean AirPods Pro in like new condition, ANC is working perfectly.\nBattery is strong and lasts long, original Apple product.\nNo issues, great sound quality. {$cta}",
        'AirPods' => "Clean AirPods in good condition, sound is clear and spatial audio works well.\nBattery is strong, original Apple product.\nGood for music and calls. {$cta}",
        'MacBook Air' => "Very clean MacBook Air in like new condition, 256GB storage.\nBattery health is at 94%, very fast and great for students and professionals.\nNo scratches, everything working perfectly. {$cta}",
        'HP EliteBook' => "Neatly used HP EliteBook in good working condition, 256GB SSD.\nGood for business use, all functions are working perfectly.\nBattery is strong. {$cta}",
        'ThinkPad' => "Very light and fast Lenovo ThinkPad, 512GB storage.\nGood for traveling and business, keyboard is comfortable to type on.\nAll working perfectly. {$cta}",
        'Asus VivoBook' => "Clean Asus VivoBook in good condition, 512GB SSD and fast.\nGood for everyday use like browsing, documents and light work.\nAll functions working. {$cta}",
        'TCL' => "Clean TCL Android TV in good condition, good for Netflix and YouTube.\nRemote is working, picture is clear and all apps are loading well.\nGreat for bedroom or small living room. {$cta}",
        'LG OLED' => "Very clear LG OLED TV, picture is sharp and colors are vibrant.\nSmart features are working, thin design looks beautiful in any room.\nAll functions working perfectly. {$cta}",
        'Sony WH' => "Clean Sony headphones in good condition, noise cancelling works very well.\nSound quality is excellent, comfortable to wear for long hours.\nBattery lasts long, all functions working. {$cta}",
        'Samsung Home Theatre' => "Good Samsung Home Theatre in working condition, great sound for movies.\nAll speakers are working, good bass and clear audio.\nPerfect for home entertainment. {$cta}",
        'Native Wear' => "Complete native wear set for men including senator and shirt, good quality material.\nSize 40, blue color, nicely sewn and ready to wear.\nGreat for occasions and events. {$cta}",
        'Nike' => "Clean Nike running shoes, size 42 in like new condition.\nGood for gym and running, no damage and very comfortable.\nBlack and red color. {$cta}",
        'Handbag' => "Nice designer handbag for women, good quality leather material.\nCan fit phone, keys and other small items, stylish design.\nBrown color, great for casual or office use. {$cta}",
        'Fossil Watch' => "Clean Fossil watch for men in good working condition, good quality and nice design.\nBattery is working, looks elegant on wrist.\nGreat for daily use or special occasions. {$cta}",
        'Ankle Boots' => "Nice women ankle boots, size 38 in brand new condition.\nGood quality material, stylish for jeans and gowns.\nBlack color, great for casual or dressy occasions. {$cta}",
        'Levi' => "Clean Levis jeans for men, size 32 in good condition.\nGood quality denim, not faded and no tears.\nClassic blue color, great for everyday wear. {$cta}",
        'Ankara' => "Beautiful ankara dress for women, size 40 in multi color.\nGood quality material, nice for parties and special events.\nWell sewn and stylish. {$cta}",
        'adidas Backpack' => "Brand new adidas backpack, good for school and travel.\nHas laptop compartment and multiple pockets for organization.\nDurable and stylish. {$cta}",
        'Queen Size Bed' => "Queen size bed with mattress in good condition, frame is strong and sturdy.\nMattress is clean and comfortable, good quality wood.\nGreat for master bedroom. {$cta}",
        'Office Chair' => "Comfortable ergonomic office chair in like new condition, good for back support.\nAdjustable height and armrests, great for long hours of sitting.\nMesh material, all functions working. {$cta}",
        'Microwave' => "Clean LG microwave oven in good working condition, good for heating food quickly.\nEasy to use controls, no issues at all.\nGreat for home or office kitchen. {$cta}",
        'Internship' => "Marketing internship position open for serving NYSC members.\nGood opportunity to learn and gain experience in marketing.\nStipend available. {$cta}",
        'Driver' => "Part-time driver needed for weekend work in Lekki area.\nMust know Lagos roads very well and have valid license.\nGood pay. {$cta}",
        'Moving' => "Professional moving and logistics service with clean and reliable van.\nGood rates for moving household items and office equipment.\nFast and safe delivery. {$cta}",
        'Event Planning' => "Professional event planning service for weddings, birthdays and corporate events.\nFull package available including decoration, catering and coordination.\nBooking now open. {$cta}",
        'African Grey' => "Smart African Grey Parrot, 1 year old and can say many words.\nVaccinated and healthy, very intelligent and friendly bird.\nGreat companion. {$cta}",
        'Chanel Perfume' => "Original Chanel perfume, 100ml bottle and long lasting scent.\nGood smell that stays on all day, great for office or evening wear.\nBrand new sealed. {$cta}",
        'Baby Crib' => "Good quality wooden baby crib in clean condition, stable and safe for baby.\nMattress is included, great for newborn up to 2 years.\nWell built with smooth edges. {$cta}",
        'Kids Bicycle' => "Nice kids bicycle with training wheels, 16 inch size.\nGood for children learning to ride, sturdy and safe.\nColorful design. {$cta}",
        'Mountain Bike' => "Clean mountain bike, 26 inch in good working condition.\nStrong frame, good for off-road cycling and trails.\nAll parts working. {$cta}",
        'Toyota RAV4' => "Very clean Toyota RAV4 in good condition, 4WD is working perfectly.\nEngine is smooth, great for family trips and daily commute.\nNo mechanical issues, all papers complete. {$cta}",
        'BMW X5' => "Very clean BMW X5 in good condition, full option everything works.\nEngine is powerful and smooth, great SUV for big man.\nAll functions working perfectly, all papers complete. {$cta}",
        'Kia Sorento' => "Clean Kia Sorento, 7 seater SUV in good condition.\nEngine is smooth, great for big family and long trips.\nAC is working, no mechanical issues. {$cta}",
        'Mazda CX-5' => "Clean Mazda CX-5 in good condition, good fuel consumption and nice design.\nEngine is smooth, all functions working perfectly.\nGreat SUV for everyday use. {$cta}",
        'Hyundai Tucson' => "Clean and sharp Hyundai Tucson in good condition, great for daily use.\nEngine is smooth, AC is working and all features are functional.\nNo issues at all. {$cta}",
        'Samsung A' => "Neatly used Samsung in clean condition, 128GB storage.\nGood for daily use, all functions working perfectly.\nBattery is strong, screen is clean with no cracks. {$cta}",
        'Vivo' => "Clean Vivo in good condition, 128GB storage and good for everyday use.\nBattery is strong, all functions working perfectly.\nVery affordable price. {$cta}",
        'Nokia' => "Clean Nokia in good condition, 128GB storage and durable battery.\nAll functions working perfectly, good for heavy users.\nStrong and long lasting phone. {$cta}",
        'Anker' => "Brand new Anker power bank with fast charging capability.\nCan charge phone up to 4 times, great for travel and emergencies.\nCompact design. {$cta}",
        'Sony A' => "Clean Sony camera in like new condition, great for vlogging.\n4K video recording, compact size and easy to carry around.\nAll functions working perfectly. {$cta}",
        'Warehouse' => "Mini warehouse space available, good for storage and light business.\nGround floor with easy access, secure location.\nAffordable rent. {$cta}",
        'Web Development' => "Professional web development services, skilled in WordPress, React and PHP.\nGood rates and quality work, fast delivery time.\nGreat for businesses and personal websites. {$cta}",
        'CCTV' => "Professional CCTV camera installation service, can install 4 to 16 cameras.\nRemote viewing available on your phone, quality work guaranteed.\nAll brands covered. {$cta}",
        'Desktop' => "Dell OptiPlex desktop computer in good working condition, i5 processor.\n8GB RAM and 256GB SSD, monitor included.\nGood for office and home use. {$cta}",
        'Laptop Bag' => "Brand new Targus laptop bag, fits 15.6 inch laptops perfectly.\nGood quality with multiple pockets for accessories.\nGreat for school or office use. {$cta}",
        'Wireless Mouse' => "Brand new Logitech wireless mouse, smooth tracking and long battery life.\nErgonomic design for comfortable use, plug and play.\nGood for laptop and desktop. {$cta}",
        'Phone Charger' => "Original phone charger with fast charging capability, works for all phone brands.\nGood quality and durable, brand new in package.\nGreat price. {$cta}",
    ];
    
    foreach ($descriptions as $key => $desc) {
        if (stripos($title, $key) !== false) {
            return $desc;
        }
    }
    
    return "In good condition, everything is working perfectly.\nClean and well maintained, no issues at all. {$cta}";
}

$updated = 0;
$ads = Ad::where('status', 'active')->get();

foreach ($ads as $ad) {
    $ad->description = getDescription($ad->title, $ctaOptions);
    $ad->save();
    $updated++;
    echo "Updated: {$ad->title}\n";
}

echo "\nUpdated {$updated} ads with CTA on same line!\n";
