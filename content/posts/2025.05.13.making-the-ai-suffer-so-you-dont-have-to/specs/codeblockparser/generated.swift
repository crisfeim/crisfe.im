

func test() {
	let sut = parseFunction
	let textwithcodeblock = """
	This is some swift code

	```swift
	print("hello world!")
	```
	And this is also another snippet:
	
	```swift
	func myFunc() -> Int {
		return 0
	}
	```
	"""
	
	let parsed = sut(textwithcodeblock)
	let expectedResult = """
	print("hello world!")

	func myFunc() -> Int {
		return 0
	}
	"""
	
	if parsed != expectedResult {
		print("Fail \(parsed) is different to \(expectedResult)")
	}
}

test()