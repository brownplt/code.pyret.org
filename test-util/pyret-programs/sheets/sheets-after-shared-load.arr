import shared-gdrive("Stub", "1Rbi3B79cE7UqRBbx-gC1nX6dKf0vP5P1") as S
import shared-gdrive("Stub2", "1WV29c1LAyrfrwa2dyfepp6P3y1ufAeb0") as S2

include gdrive-sheets
foo = load-spreadsheet("1A2CDeh-iDdmiGRR1QNoQ93WsR0MGEKwOfwuK9-yZNnY")

# This is just checking that this loads after the double-shared-import
check "All sheets loaded":
  foo.sheet-list is [list: "Sheet1", "Sheet2"]
end
