import gdrive-sheets as GS

# Public test spreadsheet
foo = GS.load-spreadsheet("1A2CDeh-iDdmiGRR1QNoQ93WsR0MGEKwOfwuK9-yZNnY")

check "All sheets loaded":
  foo.sheet-list is [list: "Sheet1", "Sheet2"]
end

check "Table loading and Type Inference":
  sheet1 = load-table: A, B, C, D, E
    source: foo.sheet-by-name("Sheet1", false)
  end

  # Loading/String inference
  (extract A from sheet1 end) is [list: "Bob", "Alice", "Nancy", "Eve", "Don"]

  # Simple number inference
  (extract B from sheet1 end) is [list: 12, 14, 15, 16, 57]
  
  # Project currency as number
  (extract C from sheet1 end) is [list: 50, 60, 20, 30, 60]
  
  # Project dates as strings/Missing cell
  (extract D from sheet1 end) is [list: some("10/10/1996"),
                                        some("12/1/1995"),
                                        some("9/2/2006"),
                                        some("1/1/2016"),
                                        none]
  
  # Project booleans
  (extract E from sheet1 end) is [list: true, true, true, false, false]

end