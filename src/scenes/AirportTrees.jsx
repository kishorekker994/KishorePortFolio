import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Box3, Group, Vector3 } from 'three';
import PropTypes from 'prop-types';

export default function AirportTrees({ journey }) {
  const [forest, setForest] = useState(null);
  const trees = useRef([]);
  const { invalidate } = useThree();
  useEffect(() => {
    let cancelled = false;
    let models = [];
    import('@dgreenheck/ez-tree').then(({ Tree, LeafType, BarkType }) => {
      if (cancelled) return;
      models = [31, 82, 117].map((seed, index) => {
        const tree = new Tree();
        tree.options.seed = seed;
        tree.options.leaves.type = [LeafType.Oak, LeafType.Ash, LeafType.Aspen][index];
        tree.options.bark.type = [BarkType.Oak, BarkType.Willow, BarkType.Birch][index];
        tree.options.branch.angle[1] = [75, 45, 22][index];
        tree.options.branch.length[1] = [18, 10, 6][index];
        tree.options.branch.children = [{ 0: 6, 1: 4, 2: 3 }, { 0: 5, 1: 3, 2: 3 }, { 0: 8, 1: 3, 2: 2 }][index];
        tree.options.leaves.count = 6;
        tree.options.leaves.size = [3.8, 2.8, 2.2][index];
        tree.options.leaves.tint = [0x7c9a61, 0x9ca970, 0x6d8e60][index];
        tree.options.bark.tint = [0x918476, 0x9c9383, 0xb1afa0][index];
        tree.generate();
        const dimensions = new Box3().setFromObject(tree).getSize(new Vector3());
        tree.scale.setScalar([4.6, 4, 5.4][index] / dimensions.y);
        return tree;
      });
      const group = new Group();
      group.name = 'textured-airfield-trees';
      for (let index = 0; index < 30; index++) {
        const tree = models[index % models.length].clone(true);
        const horizontal = (index % 15 - 7) * 12 + Math.sin(index * 2.1) * 2;
        const nearRunway = index < 15 && (horizontal < -55 || horizontal > -10);
        tree.position.set(horizontal, 0, nearRunway ? -8 - index % 3 * 2 : -24 - index % 4 * 3);
        tree.rotation.y = index * 1.73;
        tree.scale.multiplyScalar(0.75 + index % 4 * 0.12);
        if (nearRunway) tree.scale.multiplyScalar(0.65);
        group.add(tree);
      }
      trees.current = models;
      setForest(group);
      invalidate();
    }).catch(error => console.error('Tree assets could not load', error));
    return () => {
      cancelled = true;
      trees.current = [];
      models.forEach(tree => tree.traverse(object => {
        object.geometry?.dispose();
        if (object.material) object.material.dispose();
      }));
    };
  }, [invalidate]);
  useFrame(({ clock }) => {
    if (forest) forest.children.forEach((tree, index) => {
      const wind = journey.current.reduced ? 0 : Math.sin(clock.elapsedTime * 0.85 + index * 0.6) * 0.018 + Math.sin(clock.elapsedTime * 1.7 + index) * 0.008;
      tree.rotation.z = wind;
      tree.rotation.x = wind * 0.45;
    });
    trees.current.forEach(tree => tree.update(journey.current.reduced ? 0 : clock.elapsedTime * 0.65));
  });
  return forest && <primitive object={forest} dispose={null} />;
}

AirportTrees.propTypes = { journey: PropTypes.shape({ current: PropTypes.object }).isRequired };