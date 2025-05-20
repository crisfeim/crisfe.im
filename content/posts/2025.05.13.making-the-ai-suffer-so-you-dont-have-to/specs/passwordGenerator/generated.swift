import Foundation

class PasswordGenerator {
    func generate() -> String {
        let uppercaseLetter = String(Unicode.Scalar(65 + Int(arc4random_uniform(26)))!)
        let lowercaseLetter = String(Unicode.Scalar(97 + Int(arc4random_uniform(26)))!)
        let digit = String(Int(arc4random_uniform(10)))
        let specialCharacter = "!@#$%^&*()_+-=[]{}|;:'\",.<>?/`~"
        let specialChar = String(specialCharacter[specialCharacter.index(specialCharacter.startIndex, offsetBy: Int(arc4random_uniform(UInt32(specialCharacter.count))))])

        var password = uppercaseLetter + lowercaseLetter + digit + specialChar

        while password.count < 8 {
            let randomChar = String(Unicode.Scalar(33 + Int(arc4random_uniform(94)))!)
            password += randomChar
        }

        return password
    }
}

func test_password_has_at_least_eight_characters() {
	let sut = PasswordGenerator()
	let password = sut.generate()
	if password.count < 8 {
		fail("Password should have at least eight characters")
	}
}

func test_password_contains_at_least_one_uppercase_letter() {
	let sut = PasswordGenerator()
	let password = sut.generate()
	let uppercaseRange = password.rangeOfCharacter(from: .uppercaseLetters)
	if uppercaseRange == nil {
		fail("Password should contain at least one uppercase letter")
	}
}

func test_password_contains_at_least_one_lowercase_letter() {
	let sut = PasswordGenerator()
	let password = sut.generate()
	let lowercaseRange = password.rangeOfCharacter(from: .lowercaseLetters)
	if lowercaseRange == nil {
		fail("Password should contain at least one lowercase letter")
	}
}

func test_password_contains_at_least_one_digit() {
	let sut = PasswordGenerator()
	let password = sut.generate()
	let digitRange = password.rangeOfCharacter(from: .decimalDigits)
	if digitRange == nil {
		fail("Password should contain at least one digit")
	}
}

func test_password_contains_at_least_one_special_character() {
	let sut = PasswordGenerator()
	let password = sut.generate()
	let specialCharacters = CharacterSet(charactersIn: "!@#$%^&*()_+-=[]{}|;:'\",.<>?/`~")
	let specialCharRange = password.rangeOfCharacter(from: specialCharacters)
	if specialCharRange == nil {
		fail("Password should contain at least one special character")
	}
}

func test_password_does_not_contain_spaces() {
	let sut = PasswordGenerator()
	let password = sut.generate()
	if password.contains(" ") {
		fail("Password should not contain spaces")
	}
}

func test_password_is_unique() {
	let sut = PasswordGenerator()
	let password1 = sut.generate()
	let password2 = sut.generate()
	if password1 == password2 {
		fail("Generated passwords should be unique")
	}
}

func test_password_meets_all_criteria() {
	let sut = PasswordGenerator()
	let password = sut.generate()
	
	// Comprueba que la contraseña tiene al menos una letra mayúscula
	let uppercaseRange = password.rangeOfCharacter(from: .uppercaseLetters)
	if uppercaseRange == nil {
		fail("Password should contain at least one uppercase letter")
	}
	
	// Comprueba que la contraseña tiene al menos una letra minúscula
	let lowercaseRange = password.rangeOfCharacter(from: .lowercaseLetters)
	if lowercaseRange == nil {
		fail("Password should contain at least one lowercase letter")
	}
	
	// Comprueba que la contraseña tiene al menos un dígito
	let digitRange = password.rangeOfCharacter(from: .decimalDigits)
	if digitRange == nil {
		fail("Password should contain at least one digit")
	}
	
	// Comprueba que la contraseña tiene al menos un carácter especial
	let specialCharacters = CharacterSet(charactersIn: "!@#$%^&*()_+-=[]{}|;:'\",.<>?/`~")
	let specialCharRange = password.rangeOfCharacter(from: specialCharacters)
	if specialCharRange == nil {
		fail("Password should contain at least one special character")
	}
	
	// Comprueba que la contraseña no contiene espacios
	if password.contains(" ") {
		fail("Password should not contain spaces")
	}
	
	// Comprueba que la longitud es al menos 8 caracteres
	if password.count < 8 {
		fail("Password should have at least eight characters")
	}
}

test_password_has_at_least_eight_characters()
test_password_contains_at_least_one_uppercase_letter()
test_password_contains_at_least_one_lowercase_letter()
test_password_contains_at_least_one_digit()
test_password_contains_at_least_one_special_character()
test_password_does_not_contain_spaces()
test_password_is_unique()
test_password_meets_all_criteria()

// Función auxiliar para imprimir el fallo
func fail(_ description: String, function: String = #function) {
	print("❌ — \(function), \(description)")
}