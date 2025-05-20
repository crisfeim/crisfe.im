import Foundation

class FileImporter {
    func scanImports(atContent content: String) -> Set<String> {
        var imports = Set<String>()
        let lines = content.components(separatedBy: .newlines)

        for line in lines {
            if line.hasPrefix("import ") {
                let importStatement = line.dropFirst(7)
                imports.insert(String(importStatement))
            }
        }

        return imports
    }
}

func tests() {
    let sut = FileImporter()
    let code = """
    import a.swift
    import b.swift
    import some_really_long_named_file.swift

    let a = B()
    """

    let output = sut.scanImports(atContent: code)
    let expectedOutput: Set<String> = ["a.swift", "b.swift", "some_really_long_named_file.swift"]

    assert(output == expectedOutput)
}

tests()

import Foundation

class FileImporter {
    func scanImports(atContent content: String) -> Set<String> {
        var imports = Set<String>()
        let lines = content.components(separatedBy: .newlines)

        for line in lines {
            if line.hasPrefix("import ") {
                let importStatement = line.dropFirst(7)
                imports.insert(String(importStatement))
            }
        }

        return imports
    }
}

func tests() {
    let sut = FileImporter()
    let code = """
    import a.swift
    import b.swift
    import some_really_long_named_file.swift

    let a = B()
    """

    let output = sut.scanImports(atContent: code)
    let expectedOutput: Set<String> = ["a.swift", "b.swift", "some_really_long_named_file.swift"]

    assert(output == expectedOutput)
}

tests() func tests() {
	let sut = FileImporter()
	let code = """
	import a.swift
	import b.swift
	import some_really_long_named_file.swift

	let a = B()
	"""
	
	let output = sut.scanImports(atContent: code)
	let expectedOutput: Set<String> = ["a.swift", "b.swift", "some_really_long_named_file.swift"]
	
	assert(output == expectedOutput)
}

tests()