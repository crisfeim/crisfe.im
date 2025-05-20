import Foundation

class LineAppender {
    func parse(_ string: String) -> String {
        var result = ""
        var lineNumber = 1
        for line in string.components(separatedBy: "\n") {
            result += "\(lineNumber) \(line)\n"
            lineNumber += 1
        }
        return String(result.dropLast())
    }
} 
// Description:
// LineAppender is an object that has a `parse(_ string: String) -> String` function.
// It takes a string and will be responsible for prefix each line of the string
// with its current line number.
// The method returns the transformed string.
// You must thus implement the object `LineAppender`
// and all the apis invoked in following unit tests that act as specs
import Foundation
func test_line_appender() {
	let sut = LineAppender()
	
	let input = """
	func helloWorld() {
		print("hello world")
	}
	
	helloWorld()
	"""
	
	let output = sut.parse(input)
	
	let expectedOutput = """
	1 func helloWorld() {
	2	print("hello world")
	3 }
	4
	5 helloWorld()
	"""
	
	print("Current output: \(output)")
	assert(output == expectedOutput)
}

test_line_appender()