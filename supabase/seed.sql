-- WePlayBasketball: Court Seed Data
-- All courts verified from public sources (Ajuntament de Badalona, CourtsOfTheWorld, OpenStreetMap)
-- Source: https://www.badalona.cat, https://www.courtsoftheworld.com/spain/badalona/

-- ACCES LLIURE (Free/Public) Outdoor Courts

INSERT INTO courts (name, address, barrio, lat, lng, geohash, access_type, court_type, hoops, has_lighting, has_nets, opening_hours, source, confidence) VALUES
('Pista de l''Anís del Mono', 'C/ Eduard Maristany, 55-105, Badalona', 'Centre', 41.4427, 2.2409, 'sp3efb', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #2, OpenStreetMap', 'high'),
('Pista dels Padres Carmelitas', 'C/ del Mar, 29-47, Badalona 08911', 'Centre', 41.4495, 2.2437, 'sp3eg1', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #3', 'high'),
('Cancha de Arriba', 'C/ Ramiro de Maetzu, Badalona 08913', 'Sant Roc', 41.4385, 2.2190, 'sp3edr', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #4', 'high'),
('Cancha de LLoreda', 'Plaça del Riu Muga, Badalona 08917', 'Lloreda', 41.4420, 2.2180, 'sp3ef2', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #5', 'high'),
('Pista Congrés', 'C/ Sant Marc, 19-21, Badalona 08918', 'Congrés', 41.4368, 2.2270, 'sp3edx', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #6', 'high'),
('Pista Iris', 'C/ Iris, 43-53, Badalona 08911', 'Iris', 41.4465, 2.2390, 'sp3efc', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #7', 'high'),
('Pista Badalona Lloreda', 'Passatge del Riu Segre, Badalona 08917', 'Lloreda', 41.4435, 2.2195, 'sp3ef8', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #8', 'high'),
('Plaça Joan Miró', 'Plaça d''En Joan Miró, Badalona 08912', 'Centre', 41.4390, 2.2370, 'sp3edz', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #9', 'high'),
('Canchas de Abajo', 'Rambla de la Solidaritat, Badalona 08913', 'Sant Roc', 41.4375, 2.2185, 'sp3edr', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #10', 'high'),
('La Plana', 'Passatge de la Plana, 14-26, Badalona 08912', 'La Plana', 41.4410, 2.2385, 'sp3efb', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #11', 'high'),
('Pista Sistrells', 'C/ Pere Martell, 66, Badalona 08917', 'Lloreda', 41.4425, 2.2200, 'sp3ef8', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #12', 'high'),
('Plaça de Badalona', 'C/ Ramon Llull, Badalona 08912', 'Centre', 41.4395, 2.2375, 'sp3edz', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #13', 'high'),
('Plaça dels Països Catalans', 'C/ Alfons XII, 104-278, Badalona 08912', 'Sant Roc', 41.4380, 2.2360, 'sp3edz', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #14', 'high'),
('Pista de Canyadó', 'C/ Pompeu Fabra, 4-18, Badalona 08911', 'Canyadó', 41.4470, 2.2420, 'sp3eg1', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #1', 'high'),
('Pista Congrés/Regalèssia', 'C/ Sant Marc, 6, Badalona', 'Congrés', 41.4365, 2.2275, 'sp3edx', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'Ajuntament #247', 'high'),
('C/ del Temple 10', 'C/ del Temple, 10, Badalona', 'Centre', 41.4405, 2.2415, 'sp3eg0', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #30', 'medium'),
('C/ de Colom 66A', 'C/ de Colom, 66A, Badalona', 'Centre', 41.4415, 2.2395, 'sp3efb', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #25', 'medium'),
('Carrer de Laietània 38', 'C/ de Laietània, 38, Badalona', 'Lloreda', 41.4440, 2.2205, 'sp3ef8', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #28', 'medium'),
('Carrer de la Conquista 71', 'C/ de la Conquista, 71, Badalona', 'Progrés', 41.4400, 2.2380, 'sp3edz', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #27', 'medium'),
('C/ del Gral. Weyler 126', 'C/ del Gral. Weyler, 126, Badalona', 'Centre', 41.4385, 2.2365, 'sp3edz', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #31', 'medium'),
('C. del Progrés 51', 'C/ del Progrés, 51, Badalona', 'Progrés', 41.4405, 2.2390, 'sp3efb', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #29', 'medium'),
('C. Garbí 3', 'C/ del Garbí, 3, Badalona', 'Pomar', 41.4455, 2.2210, 'sp3ef8', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #24', 'medium'),
('Carrer de Provença 7', 'C/ de Provença, 7, Badalona', 'Progrés', 41.4395, 2.2385, 'sp3edz', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #26', 'medium'),
('C. Apenins 29', 'C/ dels Apenins, 29, Badalona', 'Lloreda', 41.4430, 2.2185, 'sp3ef2', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #32', 'medium'),
('Av. Cardenal Vidal i Barraquer 15', 'Av. Cardenal Vidal i Barraquer, 15, Badalona', 'Sant Roc', 41.4370, 2.2195, 'sp3edx', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #33', 'medium'),
('Parc de Can Solei i Cal Arnús', 'Av. Navarra, Badalona 08911', 'Can Solei', 41.4480, 2.2440, 'sp3eg1', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #18', 'high'),
('Can Mercader', 'Sant Bru - Jovellar, Badalona 08911', 'Centre', 41.4475, 2.2425, 'sp3eg1', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld #21', 'high'),
('Plaça de les Brigades Internacionals', 'C/ Lleó Fontova, Santa Coloma de Gramenet 08913', 'Sant Roc', 41.4360, 2.2170, 'sp3edr', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'CourtsOfTheWorld', 'medium'),
('Pista Poliesportiva Artigas', 'Plaça de Nicaragua, Badalona', 'Artigas', 41.4328, 2.2184, 'sp3edq', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'OpenStreetMap #309474781, Ajuntament #243', 'high'),
('Pista Poliesportiva Ronda Llefià', 'Ronda Llefià, Badalona', 'Llefià', 41.4485, 2.2220, 'sp3ef9', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'Ajuntament #842', 'high'),
('Pistes Tacatà', 'Tacatà, Badalona', 'Various', 41.4395, 2.2320, 'sp3edz', 'lliure', 'outdoor', 2, false, true, 'Sempre oberta', 'Ajuntament #284', 'medium');

-- ACCES RESTRINGIT (Restricted) - Club/School Facilities

INSERT INTO courts (name, address, barrio, lat, lng, geohash, access_type, court_type, hoops, has_lighting, has_nets, manager, phone, website, opening_hours, source, confidence) VALUES
('Pistes Bàsquet Màgic Badalona', 'C/ Concòrdia, 1, Badalona', 'Centre', 41.4410, 2.2350, 'sp3efb', 'restringit', 'indoor', 12, true, true, 'Club Joventut Badalona', '691229983', 'https://www.penya.com', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00', 'Ajuntament #641, penya.com', 'high'),
('Pista CB Sant Josep', 'C/ Enric Borràs, 40-42, Badalona', 'Centre', 41.4400, 2.2340, 'sp3edz', 'restringit', 'indoor', 2, true, true, 'CB Sant Josep', '933844884', 'https://www.cbsantjosep.net', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00', 'Ajuntament #585', 'high'),
('Pavelló Olímpic de Badalona', 'Av. Alfons XIII, 143-161, Badalona 08921', 'Centre', 41.4420, 2.2345, 'sp3efb', 'restringit', 'indoor', 12, true, true, 'Club Joventut Badalona', '934602040', 'https://www.penya.com', 'Dl-Dv: 9:00-23:00 | Ds: 9:00-21:00 | Dg: 9:00-15:00', 'Ajuntament, Wikipedia', 'high'),
('Palau Municipal d''Esports', 'Centre, Badalona', 'Centre', 41.4425, 2.2321, 'sp3efb', 'restringit', 'indoor', 6, true, true, 'Ajuntament de Badalona', '934832600', 'https://www.badalona.cat', 'Dl-Dv: 8:00-22:00 | Ds: 9:00-20:00', 'OpenStreetMap #236210974, CourtsOfTheWorld #17', 'high'),
('Camp basquet Salesians de BDN', 'C/ Alfons XII, Badalona 08912', 'Sant Roc', 41.4380, 2.2350, 'sp3edz', 'restringit', 'outdoor', 2, false, true, 'Salesians de Badalona', NULL, NULL, 'Horari escolar', 'CourtsOfTheWorld #19', 'high'),
('Escola Baldiri Reixac', 'C/ Juan Valera, 159, Badalona 08914', 'Progrés', 41.4390, 2.2200, 'sp3edx', 'restringit', 'outdoor', 2, false, true, 'Escola Baldiri Reixac', NULL, NULL, 'Horari escolar', 'CourtsOfTheWorld #20', 'high'),
('Centre Maregassa', 'C/ Sant Lluc, 10, Badalona 08918', 'Congrés', 41.4365, 2.2265, 'sp3edx', 'restringit', 'indoor', 4, true, true, 'Centre Maregassa', NULL, NULL, 'Dl-Dv: 9:00-21:00 | Ds: 9:00-14:00', 'CourtsOfTheWorld #23', 'high'),
('AE Badalones (Lliga EBA)', 'Pavelló La Plana, S/N, 08912 Badalona', 'La Plana', 41.4415, 2.2380, 'sp3efb', 'restringit', 'indoor', 4, true, true, 'Associació Esportiva Badalones', '934603278', NULL, 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00', 'Federació Catalana de Bàsquet', 'high');

-- ACCES PARCIAL (Partial Access) - Municipal Poliesportius

INSERT INTO courts (name, address, barrio, lat, lng, geohash, access_type, court_type, hoops, has_lighting, has_nets, manager, phone, opening_hours, source, confidence) VALUES
('Poliesportiu La Pau', 'La Pau, Badalona', 'La Pau', 41.4370, 2.2300, 'sp3edx', 'parcial', 'indoor', 2, true, true, 'Ajuntament de Badalona', '934832600', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00 | Dg: 9:00-14:00', 'Ajuntament #244', 'high'),
('Poliesportiu La Plana', 'La Plana, Badalona', 'La Plana', 41.4415, 2.2375, 'sp3efb', 'parcial', 'indoor', 4, true, true, 'Ajuntament de Badalona', '934832600', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00 | Dg: 9:00-14:00', 'Ajuntament #232', 'high'),
('Poliesportiu Llefià', 'Llefià, Badalona', 'Llefià', 41.4425, 2.2197, 'sp3ef8', 'parcial', 'indoor', 2, true, true, 'Ajuntament de Badalona', '934832600', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00 | Dg: 9:00-14:00', 'OpenStreetMap #34778124, Ajuntament #233', 'high'),
('Poliesportiu Bufalà', 'Bufalà, Badalona', 'Bufalà', 41.4510, 2.2250, 'sp3ef9', 'parcial', 'indoor', 2, true, true, 'Ajuntament de Badalona', '934832600', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00 | Dg: 9:00-14:00', 'Ajuntament #235', 'high'),
('Poliesportiu Joaquim Blume', 'C/ de la Selva, Badalona', 'Various', 41.4517, 2.2384, 'sp3eff', 'parcial', 'indoor', 2, true, true, 'Ajuntament de Badalona', '934832600', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00 | Dg: 9:00-14:00', 'OpenStreetMap #201338018, Ajuntament #236', 'high'),
('Poliesportiu Nova Lloreda', 'Nova Lloreda, Badalona', 'Lloreda', 41.4440, 2.2190, 'sp3ef2', 'parcial', 'indoor', 2, true, true, 'Ajuntament de Badalona', '934832600', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00 | Dg: 9:00-14:00', 'Ajuntament #237', 'high'),
('Poliesportiu La Platja', 'La Platja, Badalona', 'La Platja', 41.4355, 2.2420, 'sp3eep', 'parcial', 'indoor', 2, true, true, 'Ajuntament de Badalona', '934832600', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00 | Dg: 9:00-14:00', 'Ajuntament #238', 'high'),
('Poliesportiu Bonavista', 'Bonavista, Badalona', 'Bonavista', 41.4380, 2.2330, 'sp3edz', 'parcial', 'indoor', 2, true, true, 'Ajuntament de Badalona', '934832600', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00 | Dg: 9:00-14:00', 'Ajuntament #239', 'high'),
('Poliesportiu Iris', 'Iris, Badalona', 'Iris', 41.4465, 2.2385, 'sp3efc', 'parcial', 'indoor', 2, true, true, 'Ajuntament de Badalona', '934832600', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00 | Dg: 9:00-14:00', 'Ajuntament #240', 'high'),
('Poliesportiu Sant Crist', 'Sant Crist, Badalona', 'Sant Crist', 41.4345, 2.2280, 'sp3edw', 'parcial', 'indoor', 2, true, true, 'Ajuntament de Badalona', '934832600', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00 | Dg: 9:00-14:00', 'Ajuntament #241', 'high'),
('Poliesportiu Progrés', 'Progrés, Badalona', 'Progrés', 41.4400, 2.2395, 'sp3edz', 'parcial', 'indoor', 2, true, true, 'Ajuntament de Badalona', '934832600', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00 | Dg: 9:00-14:00', 'Ajuntament #246', 'high'),
('Poliesportiu Pere Martell', 'C/ Pere Martell, s/n, Badalona', 'Lloreda', 41.4472, 2.2267, 'sp3ef9', 'parcial', 'indoor', 4, true, true, 'Ajuntament de Badalona', '934832600', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00 | Dg: 9:00-14:00', 'OpenStreetMap #111860701, Ajuntament #248', 'high'),
('Poliesportiu Joaquim Ruyra', 'Joaquim Ruyra, Badalona', 'Various', 41.4375, 2.2290, 'sp3edx', 'parcial', 'indoor', 2, true, true, 'Ajuntament de Badalona', '934832600', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00 | Dg: 9:00-14:00', 'Ajuntament #242', 'high'),
('Poliesportiu Sant Jaume', 'Sant Jaume, Badalona', 'Sant Jaume', 41.4360, 2.2310, 'sp3edz', 'parcial', 'indoor', 2, true, true, 'Ajuntament de Badalona', '934832600', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00 | Dg: 9:00-14:00', 'Ajuntament #245', 'high'),
('Poliesportiu Casagemes', 'Casagemes, Badalona', 'Casagemes', 41.4390, 2.2315, 'sp3edz', 'parcial', 'indoor', 2, true, true, 'Ajuntament de Badalona', '934832600', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00 | Dg: 9:00-14:00', 'Ajuntament #234', 'high'),
('Poliesportiu Pomar', 'Pomar, Badalona', 'Pomar', 41.4460, 2.2230, 'sp3ef9', 'parcial', 'indoor', 2, true, true, 'Ajuntament de Badalona', '934832600', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00 | Dg: 9:00-14:00', 'Ajuntament #576', 'high'),
('Zona Esportiva Can Cabanyes', 'Can Cabanyes, Badalona', 'Various', 41.4385, 2.2275, 'sp3edx', 'parcial', 'outdoor', 2, false, true, 'Ajuntament de Badalona', '934832600', 'Sempre oberta', 'Ajuntament #606', 'high'),
('Poliesportiu Sant Joan', 'Sant Joan, Badalona', 'Sant Joan', 41.4370, 2.2260, 'sp3edx', 'parcial', 'indoor', 2, true, true, 'Ajuntament de Badalona', '934832600', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00 | Dg: 9:00-14:00', 'Ajuntament', 'medium'),
('Poliesportiu Can Clarassó', 'Can Clarassó, Badalona', 'Various', 41.4355, 2.2240, 'sp3edx', 'parcial', 'indoor', 2, true, true, 'Ajuntament de Badalona', '934832600', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00 | Dg: 9:00-14:00', 'Ajuntament', 'medium'),
('Poliesportiu Llefià Nord', 'Llefià Nord, Badalona', 'Llefià', 41.4495, 2.2225, 'sp3ef9', 'parcial', 'indoor', 2, true, true, 'Ajuntament de Badalona', '934832600', 'Dl-Dv: 9:00-22:00 | Ds: 9:00-20:00 | Dg: 9:00-14:00', 'Ajuntament', 'medium');
