<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST method allowed']);
    exit();
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit();
}

// Validate required fields
$required_fields = ['to', 'subject', 'html', 'profile_type'];
foreach ($required_fields as $field) {
    if (!isset($input[$field]) || empty($input[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit();
    }
}

// Email configuration - à adapter selon votre configuration
$smtp_config = [
    'host' => 'mail.aacfi.fr', // Remplacez par votre serveur SMTP
    'port' => 465,
    'username' => 'jbbejot@aacfi.fr', // Remplacez par votre email
    'password' => 'votre_mot_de_passe_smtp', // Remplacez par votre mot de passe
    'from_email' => 'jbbejot@aacfi.fr',
    'from_name' => 'Lyrisphere'
];

try {
    // Using PHPMailer (recommended) or native mail() function
    if (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
        // PHPMailer version
        use PHPMailer\PHPMailer\PHPMailer;
        use PHPMailer\PHPMailer\SMTP;
        use PHPMailer\PHPMailer\Exception;
        
        require_once 'vendor/autoload.php';
        
        $mail = new PHPMailer(true);
        
        // Server settings
        $mail->isSMTP();
        $mail->Host = $smtp_config['host'];
        $mail->SMTPAuth = true;
        $mail->Username = $smtp_config['username'];
        $mail->Password = $smtp_config['password'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = $smtp_config['port'];
        $mail->CharSet = 'UTF-8';
        
        // Recipients
        $mail->setFrom($smtp_config['from_email'], $smtp_config['from_name']);
        $mail->addAddress($input['to']);
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = $input['subject'];
        $mail->Body = $input['html'];
        
        $mail->send();
        
        echo json_encode([
            'success' => true,
            'message' => 'Email sent successfully via PHPMailer',
            'to' => $input['to'],
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        
    } else {
        // Native PHP mail() function fallback
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=UTF-8',
            'From: ' . $smtp_config['from_name'] . ' <' . $smtp_config['from_email'] . '>',
            'Reply-To: ' . $smtp_config['from_email'],
            'X-Mailer: PHP/' . phpversion()
        ];
        
        $success = mail(
            $input['to'],
            $input['subject'],
            $input['html'],
            implode("\r\n", $headers)
        );
        
        if ($success) {
            echo json_encode([
                'success' => true,
                'message' => 'Email sent successfully via native PHP mail',
                'to' => $input['to'],
                'timestamp' => date('Y-m-d H:i:s')
            ]);
        } else {
            throw new Exception('Failed to send email via native PHP mail function');
        }
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>