import { SalesRecord, PurchaseRecord, InventoryRecord } from './types';

const salesRecords: SalesRecord[] = [
  { id: 's001', date: '2024-01-05', month: '2024-01', code: 'SAM-101', description: 'Samsung 55" 4K Smart TV', brand: 'Samsung', class: 'TV', qty: 25, unitCost: 599.99, total: 14999.75, vendorId: 'V001' },
  { id: 's002', date: '2024-01-12', month: '2024-01', code: 'LG-202', description: 'LG 65" OLED TV', brand: 'LG', class: 'TV', qty: 18, unitCost: 1299.99, total: 23399.82, vendorId: 'V002' },
  { id: 's003', date: '2024-01-18', month: '2024-01', code: 'SON-303', description: 'Sony Soundbar 300W', brand: 'Sony', class: 'Audio', qty: 45, unitCost: 249.99, total: 11249.55, vendorId: 'V003' },
  { id: 's004', date: '2024-01-25', month: '2024-01', code: 'APP-404', description: 'Apple iPhone 15', brand: 'Apple', class: 'Mobile', qty: 60, unitCost: 999.99, total: 59999.40, vendorId: 'V001' },
  { id: 's005', date: '2024-02-03', month: '2024-02', code: 'DEL-505', description: 'Dell XPS 15', brand: 'Dell', class: 'Laptop', qty: 30, unitCost: 1499.99, total: 44999.70, vendorId: 'V004' },
  { id: 's006', date: '2024-02-10', month: '2024-02', code: 'JBL-606', description: 'JBL Bluetooth Speaker', brand: 'JBL', class: 'Audio', qty: 80, unitCost: 79.99, total: 6399.20, vendorId: 'V005' },
  { id: 's007', date: '2024-02-17', month: '2024-02', code: 'HP-707', description: 'HP Spectre Laptop', brand: 'HP', class: 'Laptop', qty: 22, unitCost: 1299.99, total: 28599.78, vendorId: 'V004' },
  { id: 's008', date: '2024-02-24', month: '2024-02', code: 'LEN-808', description: 'Lenovo ThinkPad X1', brand: 'Lenovo', class: 'Laptop', qty: 35, unitCost: 1399.99, total: 48999.65, vendorId: 'V003' },
  { id: 's009', date: '2024-03-02', month: '2024-03', code: 'SAM-909', description: 'Samsung Galaxy Tab S9', brand: 'Samsung', class: 'Tablet', qty: 40, unitCost: 649.99, total: 25999.60, vendorId: 'V001' },
  { id: 's010', date: '2024-03-09', month: '2024-03', code: 'BOE-110', description: 'Bose Wireless Earbuds', brand: 'Bose', class: 'Audio', qty: 55, unitCost: 199.99, total: 10999.45, vendorId: 'V002' },
  { id: 's011', date: '2024-03-16', month: '2024-03', code: 'SAM-111', description: 'Samsung Galaxy S24', brand: 'Samsung', class: 'Mobile', qty: 50, unitCost: 899.99, total: 44999.50, vendorId: 'V001' },
  { id: 's012', date: '2024-03-23', month: '2024-03', code: 'ASU-212', description: 'Asus ZenBook 14', brand: 'Asus', class: 'Laptop', qty: 28, unitCost: 1099.99, total: 30799.72, vendorId: 'V005' },
  { id: 's013', date: '2024-04-01', month: '2024-04', code: 'LG-313', description: 'LG 75" QLED TV', brand: 'LG', class: 'TV', qty: 12, unitCost: 1799.99, total: 21599.88, vendorId: 'V002' },
  { id: 's014', date: '2024-04-08', month: '2024-04', code: 'APP-414', description: 'Apple iPad Air', brand: 'Apple', class: 'Tablet', qty: 45, unitCost: 599.99, total: 26999.55, vendorId: 'V001' },
  { id: 's015', date: '2024-04-15', month: '2024-04', code: 'SON-515', description: 'Sony 27" 4K Monitor', brand: 'Sony', class: 'Monitor', qty: 35, unitCost: 449.99, total: 15749.65, vendorId: 'V003' },
  { id: 's016', date: '2024-04-22', month: '2024-04', code: 'JBL-616', description: 'JBL Home Theater System', brand: 'JBL', class: 'Audio', qty: 15, unitCost: 599.99, total: 8999.85, vendorId: 'V005' },
  { id: 's017', date: '2024-05-01', month: '2024-05', code: 'DEL-717', description: 'Dell 27" 4K Monitor', brand: 'Dell', class: 'Monitor', qty: 40, unitCost: 399.99, total: 15999.60, vendorId: 'V004' },
  { id: 's018', date: '2024-05-08', month: '2024-05', code: 'HP-818', description: 'HP LaserJet Pro', brand: 'HP', class: 'Printer', qty: 20, unitCost: 349.99, total: 6999.80, vendorId: 'V004' },
  { id: 's019', date: '2024-05-15', month: '2024-05', code: 'LEN-919', description: 'Lenovo IdeaPad 5', brand: 'Lenovo', class: 'Laptop', qty: 42, unitCost: 749.99, total: 31499.58, vendorId: 'V003' },
  { id: 's020', date: '2024-05-22', month: '2024-05', code: 'BOE-020', description: 'Bose Bookshelf Speakers', brand: 'Bose', class: 'Audio', qty: 30, unitCost: 349.99, total: 10499.70, vendorId: 'V002' },
  { id: 's021', date: '2024-06-01', month: '2024-06', code: 'SAM-121', description: 'Samsung 43" LED TV', brand: 'Samsung', class: 'TV', qty: 55, unitCost: 349.99, total: 19249.45, vendorId: 'V001' },
  { id: 's022', date: '2024-06-08', month: '2024-06', code: 'APP-222', description: 'Apple MacBook Pro 14', brand: 'Apple', class: 'Laptop', qty: 25, unitCost: 1999.99, total: 49999.75, vendorId: 'V001' },
  { id: 's023', date: '2024-06-15', month: '2024-06', code: 'ASU-323', description: 'Asus ROG Gaming Monitor', brand: 'Asus', class: 'Monitor', qty: 18, unitCost: 699.99, total: 12599.82, vendorId: 'V005' },
  { id: 's024', date: '2024-06-22', month: '2024-06', code: 'LG-424', description: 'LG Soundbar SP9YA', brand: 'LG', class: 'Audio', qty: 38, unitCost: 299.99, total: 11399.62, vendorId: 'V002' },
  { id: 's025', date: '2024-01-08', month: '2024-01', code: 'SON-025', description: 'Sony WH-1000XM5', brand: 'Sony', class: 'Audio', qty: 70, unitCost: 349.99, total: 24499.30, vendorId: 'V003' },
  { id: 's026', date: '2024-02-05', month: '2024-02', code: 'APP-026', description: 'Apple iPad Mini', brand: 'Apple', class: 'Tablet', qty: 35, unitCost: 499.99, total: 17499.65, vendorId: 'V001' },
  { id: 's027', date: '2024-03-12', month: '2024-03', code: 'DEL-027', description: 'Dell UltraSharp 32', brand: 'Dell', class: 'Monitor', qty: 22, unitCost: 549.99, total: 12099.78, vendorId: 'V004' },
  { id: 's028', date: '2024-04-05', month: '2024-04', code: 'HP-028', description: 'HP Color Laser Printer', brand: 'HP', class: 'Printer', qty: 15, unitCost: 599.99, total: 8999.85, vendorId: 'V004' },
  { id: 's029', date: '2024-05-10', month: '2024-05', code: 'LEN-029', description: 'Lenovo Legion 5', brand: 'Lenovo', class: 'Laptop', qty: 20, unitCost: 1199.99, total: 23999.80, vendorId: 'V003' },
  { id: 's030', date: '2024-06-12', month: '2024-06', code: 'BOE-030', description: 'Bose QuietComfort Ultra', brand: 'Bose', class: 'Audio', qty: 48, unitCost: 429.99, total: 20639.52, vendorId: 'V002' },
];

const purchaseRecords: PurchaseRecord[] = [
  { id: 'p001', date: '2024-01-10', poNumber: 'PO-10001', code: 'SAM-101', description: 'Samsung 55" 4K Smart TV', brand: 'Samsung', class: 'TV', qty: 100, unitCost: 450.00, total: 45000.00, vendorId: 'V001', credit: 0, dueDate: '2024-02-10' },
  { id: 'p002', date: '2024-01-15', poNumber: 'PO-10002', code: 'LG-202', description: 'LG 65" OLED TV', brand: 'LG', class: 'TV', qty: 50, unitCost: 950.00, total: 47500.00, vendorId: 'V002', credit: 200.00, dueDate: '2024-02-15' },
  { id: 'p003', date: '2024-02-05', poNumber: 'PO-10003', code: 'SON-303', description: 'Sony Soundbar 300W', brand: 'Sony', class: 'Audio', qty: 200, unitCost: 180.00, total: 36000.00, vendorId: 'V003', credit: 0, dueDate: '2024-03-05' },
  { id: 'p004', date: '2024-02-20', poNumber: 'PO-10004', code: 'APP-404', description: 'Apple iPhone 15', brand: 'Apple', class: 'Mobile', qty: 150, unitCost: 850.00, total: 127500.00, vendorId: 'V001', credit: 500.00, dueDate: '2024-03-20' },
  { id: 'p005', date: '2024-03-10', poNumber: 'PO-10005', code: 'DEL-505', description: 'Dell XPS 15', brand: 'Dell', class: 'Laptop', qty: 80, unitCost: 1100.00, total: 88000.00, vendorId: 'V004', credit: 0, dueDate: '2024-04-10' },
  { id: 'p006', date: '2024-03-25', poNumber: 'PO-10006', code: 'JBL-606', description: 'JBL Bluetooth Speaker', brand: 'JBL', class: 'Audio', qty: 300, unitCost: 45.00, total: 13500.00, vendorId: 'V005', credit: 100.00, dueDate: '2024-04-25' },
  { id: 'p007', date: '2024-04-15', poNumber: 'PO-10007', code: 'HP-707', description: 'HP Spectre Laptop', brand: 'HP', class: 'Laptop', qty: 60, unitCost: 950.00, total: 57000.00, vendorId: 'V004', credit: 0, dueDate: '2024-05-15' },
  { id: 'p008', date: '2024-05-01', poNumber: 'PO-10008', code: 'LEN-808', description: 'Lenovo ThinkPad X1', brand: 'Lenovo', class: 'Laptop', qty: 75, unitCost: 1050.00, total: 78750.00, vendorId: 'V003', credit: 250.00, dueDate: '2024-06-01' },
  { id: 'p009', date: '2024-05-15', poNumber: 'PO-10009', code: 'SAM-909', description: 'Samsung Galaxy Tab S9', brand: 'Samsung', class: 'Tablet', qty: 120, unitCost: 480.00, total: 57600.00, vendorId: 'V001', credit: 0, dueDate: '2024-06-15' },
  { id: 'p010', date: '2024-06-01', poNumber: 'PO-10010', code: 'BOE-110', description: 'Bose Wireless Earbuds', brand: 'Bose', class: 'Audio', qty: 180, unitCost: 150.00, total: 27000.00, vendorId: 'V002', credit: 150.00, dueDate: '2024-07-01' },
  { id: 'p011', date: '2024-01-20', poNumber: 'PO-10011', code: 'APP-414', description: 'Apple iPad Air', brand: 'Apple', class: 'Tablet', qty: 90, unitCost: 499.99, total: 44999.10, vendorId: 'V001', credit: 0, dueDate: '2024-02-20' },
  { id: 'p012', date: '2024-02-28', poNumber: 'PO-10012', code: 'ASU-212', description: 'Asus ZenBook 14', brand: 'Asus', class: 'Laptop', qty: 55, unitCost: 899.99, total: 49499.45, vendorId: 'V005', credit: 0, dueDate: '2024-03-28' },
  { id: 'p013', date: '2024-03-15', poNumber: 'PO-10013', code: 'SON-515', description: 'Sony 27" 4K Monitor', brand: 'Sony', class: 'Monitor', qty: 100, unitCost: 350.00, total: 35000.00, vendorId: 'V003', credit: 200.00, dueDate: '2024-04-15' },
  { id: 'p014', date: '2024-04-20', poNumber: 'PO-10014', code: 'LG-313', description: 'LG 75" QLED TV', brand: 'LG', class: 'TV', qty: 30, unitCost: 1400.00, total: 42000.00, vendorId: 'V002', credit: 0, dueDate: '2024-05-20' },
  { id: 'p015', date: '2024-05-25', poNumber: 'PO-10015', code: 'DEL-717', description: 'Dell 27" 4K Monitor', brand: 'Dell', class: 'Monitor', qty: 110, unitCost: 299.99, total: 32998.90, vendorId: 'V004', credit: 0, dueDate: '2024-06-25' },
];

const inventoryRecords: InventoryRecord[] = [
  { id: 'i001', code: 'SAM-101', description: 'Samsung 55" 4K Smart TV', brand: 'Samsung', class: 'TV', vendorId: 'V001', qty: 75, unitCost: 450.00, totalValue: 33750.00, wioBenchmark: 45, wioActual: 42.3, salesVelocity: 1.77, inventoryStatus: 'healthy', riskLevel: 'low', abcClass: 'A', productVelocity: 'medium' },
  { id: 'i002', code: 'LG-202', description: 'LG 65" OLED TV', brand: 'LG', class: 'TV', vendorId: 'V002', qty: 30, unitCost: 950.00, totalValue: 28500.00, wioBenchmark: 30, wioActual: 28.5, salesVelocity: 1.05, inventoryStatus: 'healthy', riskLevel: 'low', abcClass: 'A', productVelocity: 'medium' },
  { id: 'i003', code: 'SON-303', description: 'Sony Soundbar 300W', brand: 'Sony', class: 'Audio', vendorId: 'V003', qty: 180, unitCost: 180.00, totalValue: 32400.00, wioBenchmark: 25, wioActual: 22.1, salesVelocity: 8.14, inventoryStatus: 'healthy', riskLevel: 'low', abcClass: 'A', productVelocity: 'fast' },
  { id: 'i004', code: 'APP-404', description: 'Apple iPhone 15', brand: 'Apple', class: 'Mobile', vendorId: 'V001', qty: 200, unitCost: 850.00, totalValue: 170000.00, wioBenchmark: 15, wioActual: 12.8, salesVelocity: 15.62, inventoryStatus: 'healthy', riskLevel: 'low', abcClass: 'A', productVelocity: 'fast' },
  { id: 'i005', code: 'DEL-505', description: 'Dell XPS 15', brand: 'Dell', class: 'Laptop', vendorId: 'V004', qty: 45, unitCost: 1100.00, totalValue: 49500.00, wioBenchmark: 35, wioActual: 31.2, salesVelocity: 1.44, inventoryStatus: 'healthy', riskLevel: 'low', abcClass: 'A', productVelocity: 'medium' },
  { id: 'i006', code: 'JBL-606', description: 'JBL Bluetooth Speaker', brand: 'JBL', class: 'Audio', vendorId: 'V005', qty: 500, unitCost: 45.00, totalValue: 22500.00, wioBenchmark: 20, wioActual: 18.5, salesVelocity: 27.03, inventoryStatus: 'healthy', riskLevel: 'low', abcClass: 'B', productVelocity: 'fast' },
  { id: 'i007', code: 'HP-707', description: 'HP Spectre Laptop', brand: 'HP', class: 'Laptop', vendorId: 'V004', qty: 20, unitCost: 950.00, totalValue: 19000.00, wioBenchmark: 40, wioActual: 38.2, salesVelocity: 0.52, inventoryStatus: 'healthy', riskLevel: 'low', abcClass: 'B', productVelocity: 'slow' },
  { id: 'i008', code: 'LEN-808', description: 'Lenovo ThinkPad X1', brand: 'Lenovo', class: 'Laptop', vendorId: 'V003', qty: 55, unitCost: 1050.00, totalValue: 57750.00, wioBenchmark: 30, wioActual: 27.8, salesVelocity: 1.98, inventoryStatus: 'healthy', riskLevel: 'low', abcClass: 'A', productVelocity: 'medium' },
  { id: 'i009', code: 'SAM-909', description: 'Samsung Galaxy Tab S9', brand: 'Samsung', class: 'Tablet', vendorId: 'V001', qty: 90, unitCost: 480.00, totalValue: 43200.00, wioBenchmark: 25, wioActual: 23.1, salesVelocity: 3.90, inventoryStatus: 'healthy', riskLevel: 'low', abcClass: 'A', productVelocity: 'medium' },
  { id: 'i010', code: 'BOE-110', description: 'Bose Wireless Earbuds', brand: 'Bose', class: 'Audio', vendorId: 'V002', qty: 5, unitCost: 150.00, totalValue: 750.00, wioBenchmark: 30, wioActual: 5.2, salesVelocity: 0.96, inventoryStatus: 'critical', riskLevel: 'critical', abcClass: 'C', productVelocity: 'slow' },
  { id: 'i011', code: 'SAM-111', description: 'Samsung Galaxy S24', brand: 'Samsung', class: 'Mobile', vendorId: 'V001', qty: 120, unitCost: 750.00, totalValue: 90000.00, wioBenchmark: 20, wioActual: 18.5, salesVelocity: 6.49, inventoryStatus: 'healthy', riskLevel: 'low', abcClass: 'A', productVelocity: 'fast' },
  { id: 'i012', code: 'ASU-212', description: 'Asus ZenBook 14', brand: 'Asus', class: 'Laptop', vendorId: 'V005', qty: 8, unitCost: 899.99, totalValue: 7199.92, wioBenchmark: 35, wioActual: 6.2, salesVelocity: 1.29, inventoryStatus: 'critical', riskLevel: 'critical', abcClass: 'C', productVelocity: 'medium' },
  { id: 'i013', code: 'LG-313', description: 'LG 75" QLED TV', brand: 'LG', class: 'TV', vendorId: 'V002', qty: 85, unitCost: 1400.00, totalValue: 119000.00, wioBenchmark: 30, wioActual: 82.4, salesVelocity: 1.03, inventoryStatus: 'overstock', riskLevel: 'high', abcClass: 'A', productVelocity: 'medium' },
  { id: 'i014', code: 'APP-414', description: 'Apple iPad Air', brand: 'Apple', class: 'Tablet', vendorId: 'V001', qty: 65, unitCost: 499.99, totalValue: 32499.35, wioBenchmark: 20, wioActual: 17.8, salesVelocity: 3.65, inventoryStatus: 'healthy', riskLevel: 'low', abcClass: 'A', productVelocity: 'medium' },
  { id: 'i015', code: 'SON-515', description: 'Sony 27" 4K Monitor', brand: 'Sony', class: 'Monitor', vendorId: 'V003', qty: 3, unitCost: 350.00, totalValue: 1050.00, wioBenchmark: 25, wioActual: 3.1, salesVelocity: 0.97, inventoryStatus: 'critical', riskLevel: 'critical', abcClass: 'C', productVelocity: 'slow' },
  { id: 'i016', code: 'JBL-616', description: 'JBL Home Theater System', brand: 'JBL', class: 'Audio', vendorId: 'V005', qty: 150, unitCost: 450.00, totalValue: 67500.00, wioBenchmark: 20, wioActual: 75.0, salesVelocity: 2.00, inventoryStatus: 'overstock', riskLevel: 'high', abcClass: 'A', productVelocity: 'medium' },
  { id: 'i017', code: 'DEL-717', description: 'Dell 27" 4K Monitor', brand: 'Dell', class: 'Monitor', vendorId: 'V004', qty: 110, unitCost: 299.99, totalValue: 32998.90, wioBenchmark: 25, wioActual: 22.0, salesVelocity: 5.00, inventoryStatus: 'healthy', riskLevel: 'low', abcClass: 'A', productVelocity: 'fast' },
  { id: 'i018', code: 'HP-818', description: 'HP LaserJet Pro', brand: 'HP', class: 'Printer', vendorId: 'V004', qty: 2, unitCost: 299.99, totalValue: 599.98, wioBenchmark: 35, wioActual: 4.0, salesVelocity: 0.50, inventoryStatus: 'critical', riskLevel: 'critical', abcClass: 'C', productVelocity: 'slow' },
  { id: 'i019', code: 'LEN-919', description: 'Lenovo IdeaPad 5', brand: 'Lenovo', class: 'Laptop', vendorId: 'V003', qty: 200, unitCost: 599.99, totalValue: 119998.00, wioBenchmark: 30, wioActual: 95.2, salesVelocity: 2.10, inventoryStatus: 'overstock', riskLevel: 'high', abcClass: 'A', productVelocity: 'medium' },
  { id: 'i020', code: 'BOE-020', description: 'Bose Bookshelf Speakers', brand: 'Bose', class: 'Audio', vendorId: 'V002', qty: 60, unitCost: 280.00, totalValue: 16800.00, wioBenchmark: 25, wioActual: 23.5, salesVelocity: 2.55, inventoryStatus: 'healthy', riskLevel: 'low', abcClass: 'B', productVelocity: 'medium' },
  { id: 'i021', code: 'SAM-121', description: 'Samsung 43" LED TV', brand: 'Samsung', class: 'TV', vendorId: 'V001', qty: 250, unitCost: 280.00, totalValue: 70000.00, wioBenchmark: 30, wioActual: 120.8, salesVelocity: 2.07, inventoryStatus: 'overstock', riskLevel: 'critical', abcClass: 'A', productVelocity: 'medium' },
  { id: 'i022', code: 'APP-222', description: 'Apple MacBook Pro 14', brand: 'Apple', class: 'Laptop', vendorId: 'V001', qty: 15, unitCost: 1699.99, totalValue: 25499.85, wioBenchmark: 20, wioActual: 18.2, salesVelocity: 0.82, inventoryStatus: 'healthy', riskLevel: 'low', abcClass: 'A', productVelocity: 'slow' },
  { id: 'i023', code: 'ASU-323', description: 'Asus ROG Gaming Monitor', brand: 'Asus', class: 'Monitor', vendorId: 'V005', qty: 40, unitCost: 549.99, totalValue: 21999.60, wioBenchmark: 30, wioActual: 28.6, salesVelocity: 1.40, inventoryStatus: 'healthy', riskLevel: 'low', abcClass: 'B', productVelocity: 'medium' },
  { id: 'i024', code: 'LG-424', description: 'LG Soundbar SP9YA', brand: 'LG', class: 'Audio', vendorId: 'V002', qty: 10, unitCost: 220.00, totalValue: 2200.00, wioBenchmark: 25, wioActual: 8.3, salesVelocity: 1.20, inventoryStatus: 'low', riskLevel: 'high', abcClass: 'C', productVelocity: 'medium' },
  { id: 'i025', code: 'SON-025', description: 'Sony WH-1000XM5', brand: 'Sony', class: 'Audio', vendorId: 'V003', qty: 95, unitCost: 280.00, totalValue: 26600.00, wioBenchmark: 20, wioActual: 19.0, salesVelocity: 5.00, inventoryStatus: 'healthy', riskLevel: 'low', abcClass: 'A', productVelocity: 'fast' },
  { id: 'i026', code: 'APP-026', description: 'Apple iPad Mini', brand: 'Apple', class: 'Tablet', vendorId: 'V001', qty: 30, unitCost: 399.99, totalValue: 11999.70, wioBenchmark: 20, wioActual: 17.5, salesVelocity: 1.71, inventoryStatus: 'healthy', riskLevel: 'low', abcClass: 'B', productVelocity: 'medium' },
  { id: 'i027', code: 'DEL-027', description: 'Dell UltraSharp 32', brand: 'Dell', class: 'Monitor', vendorId: 'V004', qty: 180, unitCost: 399.99, totalValue: 71998.20, wioBenchmark: 25, wioActual: 85.7, salesVelocity: 2.10, inventoryStatus: 'overstock', riskLevel: 'high', abcClass: 'A', productVelocity: 'medium' },
  { id: 'i028', code: 'HP-028', description: 'HP Color Laser Printer', brand: 'HP', class: 'Printer', vendorId: 'V004', qty: 75, unitCost: 499.99, totalValue: 37499.25, wioBenchmark: 30, wioActual: 72.0, salesVelocity: 1.04, inventoryStatus: 'overstock', riskLevel: 'high', abcClass: 'A', productVelocity: 'medium' },
  { id: 'i029', code: 'LEN-029', description: 'Lenovo Legion 5', brand: 'Lenovo', class: 'Laptop', vendorId: 'V003', qty: 4, unitCost: 999.99, totalValue: 3999.96, wioBenchmark: 30, wioActual: 5.8, salesVelocity: 0.69, inventoryStatus: 'critical', riskLevel: 'critical', abcClass: 'C', productVelocity: 'slow' },
  { id: 'i030', code: 'BOE-030', description: 'Bose QuietComfort Ultra', brand: 'Bose', class: 'Audio', vendorId: 'V002', qty: 70, unitCost: 350.00, totalValue: 24500.00, wioBenchmark: 25, wioActual: 22.8, salesVelocity: 3.07, inventoryStatus: 'healthy', riskLevel: 'low', abcClass: 'B', productVelocity: 'medium' },
];

export function getStaticSalesData(): SalesRecord[] {
  return salesRecords;
}

export function getStaticPurchaseData(): PurchaseRecord[] {
  return purchaseRecords;
}

export function getStaticInventoryData(): InventoryRecord[] {
  return inventoryRecords;
}

// Kept for backward compatibility — only use client-side after mount
export function generateSalesData(_count?: number): SalesRecord[] {
  return salesRecords;
}

export function generatePurchaseData(_count?: number): PurchaseRecord[] {
  return purchaseRecords;
}

export function generateInventoryData(_count?: number): InventoryRecord[] {
  return inventoryRecords;
}
