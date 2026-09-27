# Formatos moleculares 3D

```pdb
ATOM      1  O   HOH A   1       0.000   0.000   0.000  1.00  0.00           O
ATOM      2  H1  HOH A   1       0.759   0.000   0.504  1.00  0.00           H
ATOM      3  H2  HOH A   1      -0.759   0.000   0.504  1.00  0.00           H
END
```

```cif
data_water
loop_
_atom_site_label
_atom_site_type_symbol
_atom_site_Cartn_x
_atom_site_Cartn_y
_atom_site_Cartn_z
O1 O 0.000 0.000 0.000
H1 H 0.759 0.000 0.504
H2 H -0.759 0.000 0.504
```

```mmcif
data_water
loop_
_atom_site.group_PDB
_atom_site.id
_atom_site.type_symbol
_atom_site.label_atom_id
_atom_site.Cartn_x
_atom_site.Cartn_y
_atom_site.Cartn_z
ATOM 1 O O 0.000 0.000 0.000
ATOM 2 H H1 0.759 0.000 0.504
ATOM 3 H H2 -0.759 0.000 0.504
```

```sdf
water
  MathJSLab

  3  2  0  0  0  0            999 V2000
    0.0000    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    0.7586    0.0000    0.5043 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.7586    0.0000    0.5043 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  1  3  1  0  0  0  0
M  END
$$$$
```

```mol2
@<TRIPOS>MOLECULE
water
3 2 0 0 0
SMALL
NO_CHARGES
@<TRIPOS>ATOM
1 O 0.000 0.000 0.000 O.3 1 HOH 0.0
2 H1 0.759 0.000 0.504 H 1 HOH 0.0
3 H2 -0.759 0.000 0.504 H 1 HOH 0.0
@<TRIPOS>BOND
1 1 2 1
2 1 3 1
```

```xyz
3
water molecule
O 0.000 0.000 0.000
H 0.759 0.000 0.504
H -0.759 0.000 0.504
```

```cube
water density
generated test fixture
3 0.0 0.0 0.0
1 1.0 0.0 0.0
1 0.0 1.0 0.0
1 0.0 0.0 1.0
8 0.0 0.0 0.0 0.0
1 0.0 0.759 0.0 0.504
1 0.0 -0.759 0.0 0.504
0.0
```
