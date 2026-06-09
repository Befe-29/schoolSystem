<?php
session_start();
include 'config.php';

if (isset($_POST['login'])) {

    $username = trim($_POST['username']);
    $password = $_POST['password'];
    $role     = $_POST['role'];

    $allowed_roles = ['admin', 'teacher', 'parent'];
    if (!in_array($role, $allowed_roles)) {
        $error = "Invalid role selected!";
    } else {

        // Authenticate
        $stmt = $conn->prepare("
            SELECT id, password, role 
            FROM users 
            WHERE username=? AND role=? AND status='approved'
        ");
        $stmt->bind_param("ss", $username, $role);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();

        if ($user && password_verify($password, $user['password'])) {

            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role']    = $user['role'];

            /* ===== ROLE DATA ===== */

            // TEACHER
            if ($role === 'teacher') {
                $t = $conn->prepare("
                    SELECT id 
                    FROM teachers 
                    WHERE user_id = ?
                ");
                $t->bind_param("i", $user['id']);
                $t->execute();
                $teacher = $t->get_result()->fetch_assoc();

                if (!$teacher) {
                    session_destroy();
                    die("Teacher profile not found. Contact admin.");
                }

                $_SESSION['teacher_id'] = $teacher['id'];
                header("Location: teacher/dashboard.php");
                exit;
            }

            // PARENT
            if ($role === 'parent') {
                $p = $conn->prepare("
                    SELECT id 
                    FROM parents 
                    WHERE user_id = ?
                ");
                $p->bind_param("i", $user['id']);
                $p->execute();
                $parent = $p->get_result()->fetch_assoc();

                if (!$parent) {
                    session_destroy();
                    die("Parent profile not found. Contact admin.");
                }

                $_SESSION['parent_id'] = $parent['id'];
                header("Location: parent/dashboard.php");
                exit;
            }

            // ADMIN
            header("Location: admin/dashboard.php");
            exit;

        } else {
            $error = "Invalid username, password, or account not approved yet!";
        }
    }
}
?>



<!DOCTYPE html>
<html>
<head>
    <title>Login - School System</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<div class="login-container">
    <h2>School System Login</h2>
    <form method="POST" class="login-form">
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>

        <label for="role">Login as:</label>
        <select name="role" id="role" class="role" required>
            <option value="">-- Select Role --</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="parent">Parent</option>
        </select>

        <button type="submit" name="login">Login</button>
        <?php if(isset($error)) echo "<p class='error'>$error</p>"; ?>
    </form>
    <!-- Signup link -->
<p class="signup-link">
    Don't have an account? 
    <a href="register.php">Sign up here</a>
</p>
</div>
</body>
</html>
